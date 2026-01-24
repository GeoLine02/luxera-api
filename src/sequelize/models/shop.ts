import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import User from "./user";
import { TypeModels } from "./associate";

class Shop extends Model {
  declare id: number;
  declare shop_name: string;
  declare password: string;
  declare owner_id: number;

  static associate(models: TypeModels) {
    Shop.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });

    Shop.hasMany(models.Products, {
      foreignKey: "shop_id",
      as: "products",
      onDelete: "CASCADE",
      hooks: true,
    });
    Shop.hasMany(models.Notifications, {
      foreignKey: "shop_id",
      as: "notifications",
    });

    Shop.belongsTo(models.Cities, {
      foreignKey: "city_id",
      as: "city",
    });
    Shop.hasMany(models.Orders, {
      foreignKey: "shop_id",
      as: "orders",
    });
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
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "Cities",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    custom_city_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "Shop",
    tableName: "Shops",
    timestamps: true,
  },
);

export default Shop;
