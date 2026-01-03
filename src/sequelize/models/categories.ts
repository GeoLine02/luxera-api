import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";

interface CategoryAttributes {
  id: number;
  category_name: string;
  category_image: string;
  category_name_ka: string;
}

class Categories extends Model implements CategoryAttributes {
  declare id: number;
  declare category_name: string;
  declare category_image: string;
  declare category_name_ka: string;

  static associate(models: TypeModels) {
    Categories.hasMany(models.SubCategories, {
      foreignKey: "category_id",
      as: "subCategories",
    });
  }
}

Categories.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category_name: { type: DataTypes.STRING, allowNull: false, unique: true },
    category_name_ka: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    category_image: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "Categories",
    tableName: "Categories",
    timestamps: true,
  }
);

export default Categories;
