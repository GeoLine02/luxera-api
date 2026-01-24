"use strict";

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";

interface OrderTotalAttributes {
  id: string;
  order_id: string;
  value: number;
}

interface OrderTotalCreationAttributes extends Optional<
  OrderTotalAttributes,
  "id"
> {}

class OrderTotals
  extends Model<OrderTotalAttributes, OrderTotalCreationAttributes>
  implements OrderTotalAttributes
{
  declare id: string;
  declare order_id: string;
  declare value: number;

  static associate(models: TypeModels) {
    // Each order total belongs to one order
    OrderTotals.belongsTo(models.Orders, {
      foreignKey: "order_id",
      as: "order",
      onDelete: "CASCADE",
    });
  }
}

OrderTotals.init(
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
    value: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrderTotals",
    tableName: "OrderTotals",
    timestamps: true,
  },
);

export default OrderTotals;
