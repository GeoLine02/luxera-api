import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import Products from "./products";
import SubCategories from "./subcategories";

class Categories extends Model {
  declare id: number;
  declare categoryName: string;
  declare categoryImage: string;

  static associate(models:any) {

    Categories.hasMany(models.SubCategories, {
  foreignKey: "categoryId",
  as: "subCategories",
});
  }
}

Categories.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    categoryName: { type: DataTypes.STRING, allowNull: false, unique: true },
    categoryImage: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "Categories",
    tableName: "Categories",
    timestamps: true,
  }
);



export default Categories;
