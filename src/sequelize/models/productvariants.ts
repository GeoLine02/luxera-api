"use strict";

import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import Products from "./products";

class ProductVariants extends Model {
  declare id: number;
  declare variantName: string;
  declare variantPrice: number;
  declare variantQuantity: number;
  declare variantDiscount: number;
  declare product_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associate(models:any) {
    // Each variant belongs to one product
    ProductVariants.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "Product",
    });
    ProductVariants.hasMany(models.ProductImages, {
      foreignKey:"variant_id",
      as:"images"
    })
  }
}

ProductVariants.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    variantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variantPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    variantQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    variantDiscount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
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
