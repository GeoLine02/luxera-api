import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";
interface ProductAttributes {
  id: number;
  product_name: string;
  product_price: number;
  product_description: string | null;
  product_rating: number;
  product_image: string;
  product_owner_id: number;
  product_subcategory_id: number;
  product_status: string;
  shop_id:number,
  product_quantity:number,
  product_discount:number

  
}
interface ProductImageAttributes {
  id:number,
  image:string,
  product_id:number,
  variant_id?:number | null
}
interface ProductVariantsAttributes {
  id: number;
  variant_name: string;
  variant_price: number;
  variant_quantity: number;
  variant_discount:number
  images:ProductImageAttributes[]
}




interface ProductCreationAtrributes extends Optional<ProductAttributes, "id"> {}
class Products extends Model<ProductAttributes,ProductCreationAtrributes>  implements ProductAttributes {
  declare id: number;
  declare product_name: string;
  declare product_price: number;
  declare product_description: string | null;
  declare product_rating: number;
  declare product_image: string;
  declare product_owner_id: number;
  declare product_subcategory_id: number;
  declare product_status: string;
  declare shop_id:number;
  declare product_quantity:number;
  declare product_discount:number
  public readonly declare variants: ProductVariantsAttributes[]
  
  
  public readonly declare images:ProductImageAttributes[]




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
    Products.hasMany(models.Carts,{
       foreignKey:"product_id"
    })

    Products.hasMany(models.ProductVariants, {
      foreignKey: "product_id",
      as: "variants",
    });

    Products.belongsTo(models.Shop, {
      foreignKey: "shop_id",
      as: "shop",
    });
    Products.hasMany(models.Carts,{
      foreignKey:"product_id",
      as:"cartItems"
    })
  }
}

Products.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_image: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: false,
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
