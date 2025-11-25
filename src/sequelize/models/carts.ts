import {
  Model,
  DataTypes,
  Optional,
} from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";

interface CartAttributes {
  id: number;
  user_id: number;
  product_id: number;
  product_quantity?: number;
  product_variant_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, "id"> {}

class Carts
  extends Model<CartAttributes, CartCreationAttributes>
  implements CartAttributes
{
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public product_quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public product_variant_id!: number

   public readonly product!: {
    id: number;
    product_name: string;
    product_price: number;
    product_image: string;
  };

  public readonly variant?: {
    id: number;
    variantName: string;
    variantPrice: number;
    images: {
      id: number;
      image: string;
    }[];
  } | null;

  static associate(models: TypeModels) {
    Carts.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Carts.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    Carts.belongsTo(models.ProductVariants, {
      foreignKey: "product_variant_id",
      as: "variant",
    })
  }
}

Carts.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      
      allowNull: false,
      references:{
        model:"Users",
        key:"id"
        
      },
      onDelete:"CASCADE",
      onUpdate:"CASCADE"
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
       model:"Products",
        key:"id"
      },
      onDelete:"CASCADE",
      onUpdate:"CASCADE"
    },
    product_quantity:{
      type: DataTypes.INTEGER,
      allowNull:false,
      defaultValue:1
    },
    product_variant_id:{
      type: DataTypes.INTEGER,
      allowNull:true,
      references:{
       model:"ProductVariants",
        key:"id"
      },
    }
  },
  {
    sequelize,
    tableName: "Carts",
    modelName: "Carts",
    timestamps: true,
  }
);

export default Carts