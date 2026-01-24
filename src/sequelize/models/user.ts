import sequelize from "../../db";
import { Model, DataTypes } from "sequelize";
import { TypeModels } from "./associate";

class User extends Model {
  declare id: number;
  declare full_name: string;
  declare email: string;
  declare password: string;

  // Add association declarations if needed
  static associate(models: TypeModels) {
    // One user → many products
    User.hasMany(models.Products, {
      foreignKey: "product_owner_id",
      as: "ownedProducts",
    });

    User.hasOne(models.Shop, {
      foreignKey: "owner_id",
      as: "shop",
    });
    User.hasMany(models.Carts, {
      foreignKey: "user_id",
      as: "cartItems",
    });
    User.hasMany(models.Orders, {
      foreignKey: "customer_id",
      as: "orders",
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true,
  },
);

export default User;
