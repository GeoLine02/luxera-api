"use strict";

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";
interface ProductImageAttributes {
  id: number;
  image: string;
  product_id: number;
  variant_id: number | null;
}
interface ProductVariantCreationAttributes
  extends Optional<ProductImageAttributes, "id"> {}

interface ProductVariantsAttributes {
  id: number;
  variant_name: string;
  variant_price: number;
  variant_quantity: number;
  variant_discount: number;
  product_id: number;
}
class ProductVariants
  extends Model<ProductVariantsAttributes, ProductVariantCreationAttributes>
  implements ProductVariantsAttributes
{
  declare id: number;
  declare variant_name: string;
  declare variant_price: number;
  declare variant_quantity: number;
  declare variant_discount: number;
  declare product_id: number;

  static associate(models: TypeModels) {
    // Each variant belongs to one product
    ProductVariants.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "Product",
    });
    ProductVariants.hasMany(models.ProductImages, {
      foreignKey: "variant_id",
      as: "images",
    });
    ProductVariants.hasMany(models.Carts, {
      foreignKey: "product_variant_id",
      as: "cartItems",
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
