import { Request, Response } from "express";
import { BasketItem, OrderPayload } from "../types/order";
import sequelize from "../db";
import { createOrderService } from "../services/order.service";
import { bogRequestOrderService } from "../payments/bog/bog.service";

import { successfulResponse } from "../utils/responseHandler";
import Shop from "../sequelize/models/shop";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import { ProductStatus } from "../constants/enums";
import { Transaction } from "sequelize";
import { bogRequestOrderController } from "../payments/bog/bog.controller";

export async function createOrderController(res: Response, req: Request) {
  const userId = req.user!.id;

  const OrderPayload: OrderPayload = req.body;
  // validate basket
  const transaction = await sequelize.transaction();
  await validateBasketForOrder(OrderPayload.basket, transaction);
  const { order, orderProducts, orderTotal } = await createOrderService(
    OrderPayload,
    userId,
    transaction,
  );

  if (order.payment_method?.startsWith("bog")) {
    if (order.payment_method === "bog_card") {
      const orderData = {
        order: order,
        orderProducts,
        orderTotal,
      };
      const url = await bogRequestOrderController(orderData, transaction);

      return successfulResponse(res, "Got Redirect Url from Bog", {
        type: "redirect",
        paymentUrl: url,
      });
    }
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
