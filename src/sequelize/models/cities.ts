import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";

interface CityAttributes {
  id: number;
  city_name: string;
}

class Cities extends Model implements CityAttributes {
  declare id: number;
  declare city_name: string;

  static associate(models: TypeModels) {
    Cities.hasMany(models.Shop, {
      foreignKey: "city_id",
      as: "shops",
    });
  }
}

Cities.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Cities",
    tableName: "Cities",
    timestamps: true,
  }
);

export default Cities;
