import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import Categories from "./categories";

class SubCategories extends Model {
  declare id: number;
  declare subCategoryName: string;
  declare subCategoryImage: string;
  declare categoryId: number;

  static associate() {
    SubCategories.belongsTo(Categories, {
      foreignKey: "categoryId",
      as: "category",
    });
  }
}

SubCategories.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    subCategoryName: { type: DataTypes.STRING, allowNull: false },
    subCategoryImage: { type: DataTypes.STRING, allowNull: true },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Categories", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "SubCategories",
    tableName: "SubCategories",
    timestamps: true,
  }
);

export default SubCategories;
