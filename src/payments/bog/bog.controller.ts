import { Request, Response } from "express";
import {
  bogRequestOrderService,
  getBogAccessToken,
  verifyBOGSignature,
} from "./bog.service";
import { errorResponse, successfulResponse } from "../../utils/responseHandler";
import { OrderPayload } from "../../types/order";
import Orders from "../../sequelize/models/orders";
import { Order, Sequelize, Transaction, where } from "sequelize";
import OrderProducts from "../../sequelize/models/orderProducts";
import OrderTotals from "../../sequelize/models/orderTotals";
import { PaymentMethods } from "../enums";
import { OrderStatus } from "../../constants/enums";
import Products from "../../sequelize/models/products";
import ProductVariants from "../../sequelize/models/productvariants";
import sequelize from "../../db";
import { success } from "zod";
import { BadRequestError, UnauthorizedError } from "../../errors/errors";
export const BOG_TEST_CLIENT_ID = "10000085";
export const BOG_TEST_SECRET = "61EsCkTvEug4";

export interface OrderDataType {
  order: Orders;
  orderProducts: OrderProducts[];
  orderTotal: OrderTotals;
}
export async function bogRequestOrderController(
  orderData: OrderDataType,
  transaction: Transaction,
) {
  // authorize at bog.

  const accessToken = await getBogAccessToken();
  const requestOrderResponse = await bogRequestOrderService(
    accessToken,
    orderData,
  );
  const { id, _links } = requestOrderResponse;
  // add gateway id to orders table
  await Orders.update(
    {
      gateway_order_id: id,
      payment_method: PaymentMethods.BOGCARD,
    },
    {
      where: {
        id: orderData.order.id,
        customer_id: orderData.order.customer_id,
      },
      transaction,
    },
  );
  console.log("bog Response", { id: id, links: _links });

  return _links.redirect.href;
}

export async function bogCallbackController(req: Request, res: Response) {
  const rawBody = (req as any).rawBody;

  verifyBOGSignature(rawBody, req.headers);

  const { event, body } = req.body;
  // 1. VALIDATE CALLBACK FORMAT
  if (event !== "order_payment" || !body || !body.order_id) {
    throw new BadRequestError("Invalid callback format");
  }
  const { order_id, order_status } = body;
  const bogStatusKey = order_status?.key;
  const transaction = await sequelize.transaction();
  try {
    // 3. FIND ORDER WITH LOCK
    const order = await Orders.findOne({
      where: { gateway_order_id: order_id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      console.warn(`Order not found for gateway_order_id: ${order_id}`);
      await transaction.commit();
      return res.status(200).json({
        message: "Order Processed",
      });
    }
    // 5. MAP BOG STATUS
    let orderStatusToUpdate = "order_payment_due";
    let shouldDecrementStock = false;
    switch (bogStatusKey) {
      case "completed":
        orderStatusToUpdate = OrderStatus.OrderPaid;
        shouldDecrementStock = true;
        break;
      case "rejected":
        orderStatusToUpdate = "order_cancelled";
        break;
      case "refunded":
        orderStatusToUpdate = "order_returned";
        // Don't restore stock here - handle separately if needed
        break;
      case "refunded_partially":
        orderStatusToUpdate = "order_problem";
        break;
      case "processing":
      case "created":
        orderStatusToUpdate = "order_payment_due";
        break;
      default:
        orderStatusToUpdate = "order_payment_due";
    }

    // 6. UPDATE ORDER STATUS
    const updateData: any = {
      status: orderStatusToUpdate,
    };

    if (bogStatusKey === "completed") {
      updateData.date_purchased = Sequelize.fn("NOW");
    }

    await order.update(updateData, { transaction });

    // 7. ✅ DECREMENT STOCK CORRECTLY
    if (shouldDecrementStock) {
      // Get all order items with quantities
      const orderProducts = await OrderProducts.findAll({
        where: { order_id: order.id },
        transaction,
      });

      if (orderProducts.length === 0) {
        throw new Error("Order has no products");
      }

      // Lock all variants first
      const variantIds = orderProducts.map((prod) => prod.variant_id);
      const sellerProductVariants = await ProductVariants.findAll({
        where: { id: variantIds },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const variantMap = new Map(sellerProductVariants.map((v) => [v.id, v]));

      // Validate stock is available for all items
      for (const orderProduct of orderProducts) {
        const variant = variantMap.get(orderProduct.variant_id);
        if (!variant) {
          throw new Error(`Variant ${orderProduct.variant_id} not found`);
        }

        if (variant.variant_quantity < orderProduct.product_quantity) {
          throw new Error(
            `Insufficient stock for variant ${orderProduct.variant_id}: ` +
              `expected ${orderProduct.product_quantity}, found ${variant.variant_quantity}`,
          );
        }
      }
      // ✅ BULK UPDATE (not loop)
      // Use raw SQL or bulk update for performance
      for (const orderProduct of orderProducts) {
        await ProductVariants.update(
          {
            variant_quantity: Sequelize.literal(
              `variant_quantity - ${orderProduct.product_quantity}`,
            ),
          },
          {
            where: { id: orderProduct.variant_id },
            transaction,
          },
        );

        console.log(
          `[STOCK] Decremented variant ${orderProduct.variant_id} by ${orderProduct.product_quantity}`,
        );
      }
      // update sales count
    }

    // 9. COMMIT TRANSACTION
    await transaction.commit();

    console.log(
      `[SUCCESS] Callback processed: order ${order.id}, ` +
        `status ${bogStatusKey} → ${orderStatusToUpdate}, ` +
        `stock decremented: ${shouldDecrementStock}`,
      "",
    );

    return successfulResponse(res, "Callback Processed Successfully", {
      orderId: order.id,
      status: orderStatusToUpdate,
    });
  } catch (txError) {
    await transaction.rollback();
    console.error("[TX_ERROR] Transaction failed:", txError);
    throw txError;
  }
}
