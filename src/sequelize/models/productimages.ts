import { Model, DataTypes, Optional } from "sequelize";
import Products from "./products";
import sequelize from "../../db";
import { TypeModels } from "./associate";

export interface ProductImageAttributes {
  id: number;
  product_id: number;
  variant_id: number | null;
  s3_key: string;
  is_primary: boolean;
}

interface ProductImageCreationAttributes extends Optional<
  ProductImageAttributes,
  "id"
> {}

class ProductImages
  extends Model<ProductImageAttributes, ProductImageCreationAttributes>
  implements ProductImageAttributes
{
  declare id: number;

  declare product_id: number;
  declare variant_id: number | null;
  declare s3_key: string;
  declare is_primary: boolean;
  static associate(models: TypeModels) {
    ProductImages.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    ProductImages.belongsTo(models.ProductVariants, {
      foreignKey: "variant_id",
      as: "variant",
    });
  }
}

ProductImages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ProductsVariants",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    s3_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductImages",
    tableName: "ProductImages",
    timestamps: true,
  },
);

export default ProductImages;
