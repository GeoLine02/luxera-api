import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";

class SubCategories extends Model {
  declare id: number;
  declare subCategoryName: string;
  declare subCategoryImage: string;
  declare categoryId: number;

  static associate(models: any) {  // ← Accept models parameter
    SubCategories.belongsTo(models.Categories, {
      foreignKey: "categoryId",
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