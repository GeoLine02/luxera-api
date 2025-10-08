import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import User from "./user";

class Shop extends Model {
  declare id: number;
  declare shop_name: string;
  declare password: string;
  declare owner_id: number;

  static associate() {
    Shop.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
  }
}

Shop.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shop_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
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
    modelName: "Shop",
    tableName: "Shops",
    timestamps: true,
  }
);

export default Shop;
