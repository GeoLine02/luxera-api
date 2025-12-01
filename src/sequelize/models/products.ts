import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";
import { ProductStatus } from "../../constants/enums";

interface ProductAttributes {
  id: number;
  product_description: string | null;
  product_rating: number;
  product_owner_id: number;
  product_subcategory_id: number;
  product_status: string;
  shop_id: number;
}
interface ProductImageAttributes {
  id: number;
  image: string;
  product_id: number;
  variant_id?: number | null;
}
interface ProductVariantsAttributes {
  id: number;
  variant_name: string;
  variant_price: number;
  variant_quantity: number;
  variant_discount: number;
  images: ProductImageAttributes[];
}

interface ProductCreationAtrributes extends Optional<ProductAttributes, "id"> {}
class Products
  extends Model<ProductAttributes, ProductCreationAtrributes>
  implements ProductAttributes
{
  declare id: number;
  declare product_description: string | null;
  declare product_rating: number;
  declare product_owner_id: number;
  declare product_subcategory_id: number;
  declare product_status: ProductStatus;
  declare shop_id: number;

  public declare readonly variants: ProductVariantsAttributes[];

  public declare readonly images: ProductImageAttributes[];

  static associate(models: TypeModels) {
    // Each product → belongs to one user
    Products.belongsTo(models.User, {
      foreignKey: "product_owner_id",
      as: "owner",
    });

    // Each product → belongs to one subcategory
    Products.belongsTo(models.SubCategories, {
      foreignKey: "product_subcategory_id",
      as: "subCategory",
    });

    Products.hasMany(models.ProductImages, {
      foreignKey: "product_id",
      as: "images",
    });
    Products.hasMany(models.Carts, {
      foreignKey: "product_id",
    });

    Products.hasMany(models.ProductVariants, {
      foreignKey: "product_id",
      as: "variants",
    });

    Products.belongsTo(models.Shop, {
      foreignKey: "shop_id",
      as: "shop",
    });
    Products.hasMany(models.Carts, {
      foreignKey: "product_id",
      as: "cartItems",
    });
  }
}

Products.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    product_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    shop_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Shops",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },

      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    product_subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "SubCategories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_status: {
      type: DataTypes.ENUM(
        ProductStatus.Pending,
        ProductStatus.Active,
        ProductStatus.Vip,
        ProductStatus.Featured
      ),
      allowNull: false,
      defaultValue: ProductStatus.Pending,
    },
  },
  {
    sequelize,
    modelName: "Products",
    tableName: "Products",
    timestamps: true,
  }
);

export default Products;
