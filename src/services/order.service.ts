import { OrderStatus } from "../constants/enums";
import OrderProducts from "../sequelize/models/orderProducts";
import Orders from "../sequelize/models/orders";
import OrderTotals from "../sequelize/models/orderTotals";
import { OrderPayload } from "../types/order";
import { Transaction } from "sequelize";
export async function createOrderService(
  orderPayload: OrderPayload,
  userId: number,
  transaction: Transaction,
) {
  // verify userId
  const {
    basket,
    city,
    currency = "GEL",
    email,
    payment_method,
    postcode,
    state,
    streetAddress,
    phoneNumber,
    country = "Georgia",
  } = orderPayload;
  const order = await Orders.create(
    {
      customer_id: userId,
      status: OrderStatus.OrderPendingPayment,
      payment_method: payment_method,
      currency: currency,
      customer_city: city,
      customer_country: country,
      customer_email: email,
      customer_state: state,
      customer_postcode: postcode,
      customer_street_address: streetAddress,
      customer_telephone: phoneNumber,
    },
    { transaction },
  );
  // calculate total amount
  let totalAmount = 0;
  basket.forEach((item) => {
    totalAmount += item.price * item.productQuantity;
  });

  // create orderTotals
  const orderTotal = await OrderTotals.create(
    {
      order_id: order.id,
      value: totalAmount,
    },
    { transaction },
  );

  const orderProductsPayload = basket.map((item) => {
    return {
      product_id: item.productId,
      order_id: order.id,
      product_quantity: item.productQuantity,
      product_price: item.price,
      shop_id: item.shopId,
      variant_id: item.variantId,
    };
  });
  const orderProducts = await OrderProducts.bulkCreate(orderProductsPayload, {
    transaction,
  });
  return { orderTotal, orderProducts, order };
}
