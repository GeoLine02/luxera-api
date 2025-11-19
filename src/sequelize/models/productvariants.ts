"use strict";

import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import Products from "./products";
import { TypeModels } from "./associate";

class ProductVariants extends Model {
  declare id: number;
  declare variant_name: string;
  declare variant_price: number;
  declare variant_quantity: number;
  declare variant_discount: number;
  declare product_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associate(models:TypeModels) {
    // Each variant belongs to one product
    ProductVariants.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "Product",
    });
    ProductVariants.hasMany(models.ProductImages, {
      foreignKey:"variant_id",
      as:"images"
    })
    ProductVariants.hasMany(models.Carts,{
      foreignKey:"product_variant_id",
      as:"cartItems"
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
    variant_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    variant_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    variant_discount: {
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
