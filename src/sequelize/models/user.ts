import sequelize from "../../db";
import { Model, DataTypes } from "sequelize";
import Products from "./products";
import Shop from "./shop";

class User extends Model {
  declare id: number;
  declare full_name: string;
  declare email: string;
  declare password: string;

  // Add association declarations if needed
  static associate() {
    // One user → many products
    User.hasMany(Products, {
      foreignKey: "product_owner_id",
      as: "products",
    });

    User.hasOne(Shop, {
      foreignKey: "owner_id",
      as: "shop",
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true,
  }
);

export default User;
