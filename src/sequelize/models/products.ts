import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import User from "./user";
import Categories from "./categories";

class Products extends Model {
  declare id: number;
  declare product_name: string;
  declare product_price: number;
  declare product_rating: number;
  declare product_image: string;
  declare product_owner_id: number;
  declare product_category_id: number;

  static associate() {
    // Each product → belongs to one user
    Products.belongsTo(User, {
      foreignKey: "product_owner_id",
      as: "owner",
    });

    Products.belongsTo(Categories, {
      foreignKey: "product_category_id",
      as: "category",
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
    product_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
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
