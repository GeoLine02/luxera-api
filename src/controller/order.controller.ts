import { Request, Response } from "express";
import { BasketItem, OrderPayload } from "../types/order";
import sequelize from "../db";
import { createOrderService } from "../services/order.service";
import { bogRequestOrderService } from "../payments/bog/bog.service";
import { validate } from "uuid";
import {
  paginatedResponse,
  successfulResponse,
} from "../utils/responseHandler";
import Shop from "../sequelize/models/shop";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import { ProductStatus } from "../constants/enums";
import { Order, Transaction } from "sequelize";
import { bogRequestOrderController } from "../payments/bog/bog.controller";
import Orders, { OrderDetailsAttributes } from "../sequelize/models/orders";
import { PAGE_SIZE } from "../constants/constants";
import OrderProducts from "../sequelize/models/orderProducts";
import ProductImages from "../sequelize/models/productimages";
import OrderTotals from "../sequelize/models/orderTotals";
import { generateSignedImageUrls } from "../utils/generateImageUrls";
import { User } from "../sequelize/models/associate";
import { BasketItemSchema } from "../validators/orderValidator";
import { ZodError } from "zod";

export async function createOrderController(req: Request, res: Response) {
  const userId = req.user!.id;
  const OrderPayload: OrderPayload = req.body;

  // validate basket
  const transaction = await sequelize.transaction();
  try {
    await validateBasketForOrder(OrderPayload.basket, transaction);
    const { order, orderProducts, orderTotal } = await createOrderService(
      OrderPayload,
      userId,
      transaction,
    );
    console.log(OrderPayload.payment_method);
    if (order.payment_method?.startsWith("bog")) {
      const orderData = {
        order: order,
        orderProducts,
        orderTotal,
      };
      console.log("Requesting Order From Bog");
      const url = await bogRequestOrderController(orderData, transaction);
      await transaction.commit();
      return successfulResponse(res, "Got Redirect Url from Bog", {
        type: "redirect",
        paymentUrl: url,
      });
    }
    await transaction.commit();
    return successfulResponse(res, "Order created successfully", {
      orderId: order.id,
      status: order.status,
      total: orderTotal.value,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    throw error;
  }
  // add later for other banks
}

export async function validateBasketForOrder(
  basket: BasketItem[],
  transaction: Transaction,
): Promise<void> {
  if (!basket || basket.length == 0) {
    throw new ValidationError([
      {
        field: "basket",
        message: "basket is empty",
      },
    ]);
  }

  // BATCH FETCH: Get all required data in 3 queries, not 3*N
  const shopIds = [...new Set(basket.map((item) => item.shopId))];
  const productIds = basket.map((item) => item.productId);
  const variantIds = basket.map((item) => item.variantId);

  // Query 1: Get all shops
  const shops = await Shop.findAll({
    where: { id: shopIds },
    raw: true,
  });
  const shopMap = new Map(shops.map((s) => [s.id, s]));

  // Query 2: Get all products (ACTIVE status)
  const products = await Products.findAll({
    where: {
      id: productIds,
      product_status: ProductStatus.Active, // ✅ FIXED: was Inactive
    },
    raw: true,
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Query 3: Get all variants with lock for race condition protection
  const variants = await ProductVariants.findAll({
    where: { id: variantIds },
    transaction,
    lock: transaction.LOCK.UPDATE, // ✅ Prevents race condition
  });
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // Now validate everything
  for (const basketItem of basket) {
    try {
      BasketItemSchema.parse(basketItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => {
          return {
            field: issue.path.join("."),
            message: issue.message,
          };
        });
        throw new ValidationError(formattedErrors, "Invalid Basket");
      }
    }
    const { shopId, productId, variantId, productQuantity } = basketItem;

    // Shop exists
    const shop = shopMap.get(shopId);
    if (!shop) {
      throw new NotFoundError(`Shop ${shopId} not found`);
    }

    // Product exists and belongs to shop
    const product = productMap.get(productId);
    if (!product) {
      throw new BadRequestError(`Product ${productId} not found or inactive`);
    }
    if (product.shop_id !== shopId) {
      throw new BadRequestError(
        `Product ${productId} does not belong to shop ${shopId}`,
      );
    }

    // Variant exists and belongs to product
    const variant = variantMap.get(variantId);
    if (!variant) {
      throw new NotFoundError(`Product variant ${variantId} not found`); // ✅ FIXED: was productVariant
    }
    if (variant.product_id !== productId) {
      throw new BadRequestError(
        `Variant ${variantId} does not belong to product ${productId}`,
      );
    }

    // Stock available (protected by row lock above)
    if (variant.variant_quantity < productQuantity) {
      throw new BadRequestError(
        `Product variant ${variantId}: only ${variant.variant_quantity} in stock, requested ${productQuantity}`,
      );
    }
  }
}

export async function getUserOrdersController(req: Request, res: Response) {
  const userId = req.user?.id;
  const page = Number(req.query.page) || 1;

  const offset = PAGE_SIZE * (page - 1);
  const { count, rows } = await Orders.findAndCountAll({
    where: {
      customer_id: userId,
    },
    offset: offset,
    limit: PAGE_SIZE,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: OrderTotals,
        as: "orderTotal",
      },
      {
        model: OrderProducts,
        as: "orderProducts",
      },
    ],
  });
  if (!rows) {
    throw new Error("Failed to get Orders");
  }

  const hasMore = count > page * PAGE_SIZE + rows.length;
  return paginatedResponse(res, "Got orders", rows, hasMore, page);
}
export async function GetOrderDetailsController(req: Request, res: Response) {
  const orderId = req.params.orderId;
  const userId = req.user?.id;
  if (!validate(orderId)) {
    throw new ValidationError([
      {
        field: "orderId",
        message: "invalid order id",
      },
    ]);
  }
  const order = await Orders.findOne({
    where: {
      customer_id: userId,
      id: orderId,
    },
    include: [
      {
        model: OrderTotals,
        as: "orderTotal",
      },
      {
        model: OrderProducts,
        as: "orderProducts",
        include: [
          {
            model: Products,
            as: "product",
          },
          {
            model: ProductVariants,
            as: "productVariant",
            include: [
              {
                model: ProductImages,
                as: "images",
              },
            ],
          },
        ],
      },
    ],
  });

  if (!order) {
    throw new NotFoundError("Order not Found");
  }
  const plainOrder = order.get({ plain: true }) as any;

  // ✅ Process order products and generate signed URLs
  const processedOrderProducts = await Promise.all(
    (plainOrder.orderProducts || []).map(async (orderProduct: any) => {
      // Generate signed URLs for variant images
      const signedImages = await generateSignedImageUrls(
        orderProduct.productVariant?.images || [],
      );
      return {
        ...orderProduct,
        // Nested product variant with signed URLs
        productVariant: {
          ...orderProduct.productVariant,
          images: signedImages, // ✅ Signed URLs
        },
      };
    }),
  );

  // ✅ Build final response
  const orderDetails = {
    ...order,
    orderProducts: processedOrderProducts,
  };
  return successfulResponse(res, "Got order details", orderDetails);
}
export async function getShopOrdersController(req: Request, res: Response) {
  const userId = req.user?.id;
  const shopId = req.shop?.id;

  // Validate page parameter
  const page = Number(req.query.page) || 1;
  if (page < 1) {
    throw new ValidationError([
      {
        field: "page",
        message: "Page must be a positive number",
      },
    ]);
  }

  const limit = PAGE_SIZE; // e.g. 20
  const offset = (page - 1) * limit;

  // Verify shop exists and belongs to the authenticated user
  const shop = await Shop.findOne({
    where: {
      id: shopId,
      owner_id: userId, // Only owner can see their shop's orders
    },
  });

  if (!shop) {
    throw new NotFoundError("Shop not found or you don't have permission");
  }

  // Fetch orders that contain at least one product from this shop
  const { rows: orders, count: total } = await Orders.findAndCountAll({
    distinct: true, // important when using includes + limit/offset
    limit,
    offset,
    order: [["createdAt", "DESC"]], // most recent first — change as needed

    // We need to join through OrderProduct to filter by shop
    include: [
      {
        model: OrderProducts,
        as: "orderProducts", // adjust alias if different in your model
        required: true, // INNER JOIN — only orders with products from this shop
        where: {
          shop_id: shopId,
        },
        include: [{ model: Products, as: "product" }],
      },
      // You might also want to include these commonly needed relations:
      {
        model: User,
        as: "customer",
        attributes: { exclude: ["password"] },
      },
    ],
  });
  const hasMore = total > offset + PAGE_SIZE;
  return paginatedResponse(res, "Got Shop Orders", orders, hasMore, page);
}

export async function getShopOrderDetailsController(
  req: Request,
  res: Response,
) {
  const shopId = req.shop?.id; // ← assuming you attach shop to req like in list endpoint
  const userId = req.user?.id;
  const orderId = req.params.orderId;
  console.log("validating order id", validate(orderId));
  if (!validate(orderId)) {
    throw new ValidationError([
      {
        field: "orderId",
        message: "invalid order id",
      },
    ]);
  }

  // Fetch order + verify it belongs to this shop (via OrderProduct)
  const order = await Orders.findOne({
    where: {
      id: orderId,
      customer_id: userId,
    },
    include: [
      {
        model: OrderTotals,
        as: "orderTotal",
      },
      {
        model: OrderProducts, // ← OrderProduct alias (plural in your example)
        as: "orderProducts",
        required: true, // ← ensures order actually has product from this shop
        where: {
          shop_id: shopId,
        },
        include: [
          {
            model: Products,
            as: "product",
          },
          {
            model: ProductVariants,
            as: "productVariant",
            include: [
              {
                model: ProductImages,
                as: "images",
              },
            ],
          },
        ],
      },
      // Optional but usually very useful for shop owner
      {
        model: User,
        as: "customer",
        attributes: { exclude: ["password"] },
      },
    ],
  });

  if (!order) {
    throw new NotFoundError("Order not found or does not belong to your shop");
  }

  // Flatten → plain object (common pattern)
  const plainOrder = order.get({ plain: true }) as any;

  // Process images → signed URLs (same logic as your customer controller)
  const processedOrderProducts = await Promise.all(
    (plainOrder.orderProducts || []).map(async (op: any) => {
      const signedImages = await generateSignedImageUrls(
        op.productVariant?.images || [],
      );

      return {
        ...op,
        productVariant: op.productVariant
          ? {
              ...op.productVariant,
              images: signedImages,
            }
          : null,
      };
    }),
  );
  // Final shape — keep most fields, override products with signed version
  const orderDetails = {
    ...plainOrder,
    orderProducts: processedOrderProducts,
  };

  // Remove fields shop owner shouldn't see (if any)
  // delete orderDetails.customer?.password;  // already not selected, but just in case

  return successfulResponse(res, "Order details retrieved", orderDetails);
}
