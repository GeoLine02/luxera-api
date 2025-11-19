import { Model, DataTypes, Optional } from "sequelize";
import Products from "./products";
import sequelize from "../../db";
import { TypeModels } from "./associate";

interface ProductImageAttributes {
  id: number;
  image: string;
  product_id: number;
  variant_id: number | null;
}

interface ProductImageCreationAttributes
  extends Optional<ProductImageAttributes, "id"> {}

class ProductImages
  extends Model<ProductImageAttributes, ProductImageCreationAttributes>
  implements ProductImageAttributes
{
  declare id: number;
  declare image: string;
  declare product_id: number;
  declare variant_id: number | null;

  static associate(models:TypeModels) {
    ProductImages.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    ProductImages.belongsTo(models.ProductVariants, {
      foreignKey: "variant_id",
      as: "variant",
    })
  }
}

ProductImages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
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
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "ProductImages",
    tableName: "ProductImages",
    timestamps: true,
   
  }
);

export default ProductImages;
