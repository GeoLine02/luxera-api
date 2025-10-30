"use strict";

import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import Products from "./products";

class ProductVariants extends Model {
  declare id: number;
  declare product_variant: string;
  declare product_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associate(models:any) {
    // Each variant belongs to one product
    ProductVariants.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "Product",
    });
  }
}

ProductVariants.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_variant: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "ProductVariants",
    tableName: "ProductVariants",
    timestamps: true,
  }
);

export default ProductVariants;
