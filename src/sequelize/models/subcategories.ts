import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";
import { InferAttributes } from "sequelize";
interface SubCategoryAttributes {
  id: number;
  sub_category_name: string;
  sub_category_image: string;
  category_id: number;
}

class SubCategories extends Model implements SubCategoryAttributes {
  declare id: number;
  declare sub_category_name: string;
  declare sub_category_image: string;
  declare category_id: number;

  static associate(models: TypeModels) {
    // ← Accept models parameter
    SubCategories.belongsTo(models.Categories, {
      foreignKey: "category_id",
      as: "category",
    });

    SubCategories.hasMany(models.Products, {
      foreignKey: "product_subcategory_id",
      as: "subCategoryProducts",
    });
  }
}

SubCategories.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sub_category_name: { type: DataTypes.STRING, allowNull: false },
    sub_category_image: { type: DataTypes.STRING, allowNull: true },
    category_id: {
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
