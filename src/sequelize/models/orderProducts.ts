"use strict";

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";

interface OrderProductAttributes {
  id: string;
  order_id: string;
  product_id: number;
  product_tax?: number;
  product_quantity: number;
  product_price: number;
  shop_id: number;
  variant_id: number;
}

interface OrderProductCreationAttributes extends Optional<
  OrderProductAttributes,
  "id" | "product_tax"
> {}

class OrderProducts
  extends Model<OrderProductAttributes, OrderProductCreationAttributes>
  implements OrderProductAttributes
{
  declare id: string;
  declare order_id: string;
  declare product_id: number;
  declare product_tax?: number;
  declare product_quantity: number;
  declare product_price: number;
  declare shop_id: number;
  declare variant_id: number;
  static associate(models: TypeModels) {
    // Each order product belongs to one order
    OrderProducts.belongsTo(models.Orders, {
      foreignKey: "order_id",
      as: "order",
      onDelete: "CASCADE",
    });

    // Each order product belongs to one product
    OrderProducts.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

OrderProducts.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ProductVariants",
        key: "id",
      },
    },
    product_tax: {
      type: DataTypes.DECIMAL(7, 4),
    },
    shop_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Shops",
        key: "id",
      },
    },
    product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_price: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrderProducts",
    tableName: "OrderProducts",
    timestamps: true,
  },
);

export default OrderProducts;
