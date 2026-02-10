"use strict";

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../db";
import { Products, TypeModels } from "./associate";
import { OrderStatus } from "../../constants/enums";
import { OrderProductAttributes } from "./orderProducts";
import OrderTotals from "./orderTotals";
import ProductVariants from "./productvariants";
import ProductImages from "./productimages";

export interface OrderAttributes {
  id: string;
  customer_id: number;
  customer_street_address?: string;
  customer_city?: string;
  customer_postcode?: string;
  customer_state?: string;
  customer_country?: string;
  customer_telephone?: string;
  customer_email?: string;
  payment_method?: string;
  date_purchased?: Date;
  status?: string;
  currency: string;
  shipping_module?: string;
  shipping_tax?: number;
  shipping_tax_rate?: number;
  gateway_order_id?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface OrderDetailsAttributes extends OrderAttributes {
  orderProducts: OrderProductAttributes &
    {
      product: Products;
      productVariant: ProductVariants & {
        images: ProductImages[];
      };
    }[];
  orderTotal: OrderTotals;
}

interface OrderCreationAttributes extends Optional<
  OrderAttributes,
  | "id"
  | "customer_street_address"
  | "customer_city"
  | "customer_postcode"
  | "customer_state"
  | "customer_country"
  | "customer_telephone"
  | "customer_email"
  | "payment_method"
  | "date_purchased"
  | "status"
  | "shipping_module"
  | "shipping_tax"
  | "shipping_tax_rate"
  | "gateway_order_id"
> {}

class Orders
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  declare id: string;
  declare customer_id: number;
  declare customer_street_address?: string;
  declare customer_city?: string;
  declare customer_postcode?: string;
  declare customer_state?: string;
  declare customer_country?: string;
  declare customer_telephone?: string;
  declare customer_email?: string;
  declare payment_method?: string;
  declare date_purchased?: Date;
  declare status?: string;
  declare currency: string;
  declare shipping_module?: string;
  declare shipping_tax?: number;
  declare shipping_tax_rate?: number;
  declare gateway_order_id?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  static associate(models: TypeModels) {
    // Each order belongs to one customer (user)
    Orders.belongsTo(models.User, {
      foreignKey: "customer_id",
      as: "customer",
    });

    // Each order has many order totals
    Orders.hasOne(models.OrderTotals, {
      foreignKey: "order_id",
      as: "orderTotal",
    });
    // Each order has many order products
    Orders.hasMany(models.OrderProducts, {
      foreignKey: "order_id",
      as: "orderProducts",
    });
  }
}

Orders.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    customer_street_address: {
      type: DataTypes.STRING,
    },
    customer_city: {
      type: DataTypes.STRING,
    },
    customer_postcode: {
      type: DataTypes.STRING,
    },
    customer_state: {
      type: DataTypes.STRING,
    },
    customer_country: {
      type: DataTypes.STRING,
    },
    customer_telephone: {
      type: DataTypes.STRING,
    },
    customer_email: {
      type: DataTypes.STRING,
    },
    payment_method: {
      type: DataTypes.STRING,
    },
    date_purchased: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM(
        OrderStatus.OrderCancelled,
        OrderStatus.OrderDelivered,
        OrderStatus.OrderInTransit,
        OrderStatus.OrderPaymentDue,
        OrderStatus.OrderPickupAvailable,
        OrderStatus.OrderProblem,
        OrderStatus.OrderProcessing,
        OrderStatus.OrderReturned,
        OrderStatus.OrderPendingPayment,
        OrderStatus.OrderPaid,
      ),
    },
    currency: {
      type: DataTypes.CHAR(3),
      allowNull: false,
    },
    shipping_module: {
      type: DataTypes.STRING,
    },
    shipping_tax: {
      type: DataTypes.DECIMAL(7, 2),
    },
    shipping_tax_rate: {
      type: DataTypes.DECIMAL(7, 2),
    },
    gateway_order_id: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Orders",
    tableName: "Orders",
    timestamps: true,
  },
);

export default Orders;
