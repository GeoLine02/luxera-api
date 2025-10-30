import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import User from "./user";

import SubCategories from "./subcategories";
import ProductImages from "./productimages";

import Categories from "./categories";
import productvariants from "./productvariants";


class Products extends Model {
  declare id: number;
  declare product_name: string;
  declare product_price: number;
  declare product_rating: number;
  declare product_image: string;
  declare product_owner_id: number;
  declare product_subcategory_id: number;
  declare product_status: string;

  static associate(models:any) {
    // Each product → belongs to one user
    Products.belongsTo(models.User, {
      foreignKey: "product_owner_id",
      as: "owner",
    });

    
    // Each product → belongs to one subcategory
    Products.belongsTo(models.SubCategories, {
      foreignKey: "product_subcategory_id",
      as: "subCategory",
    });

    Products.hasMany(models.ProductImages,{
      foreignKey:"product_image_id",
      as:"images",
    })


    Products.hasMany(models.ProductVariants, {
      foreignKey: "product_id",
      as: "variants",
    });

  }
}

Products.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
 

    product_subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "SubCategories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Products",
    tableName: "Products",
    timestamps: true,
  }
);

export default Products;
