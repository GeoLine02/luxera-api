import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { ConversationMessage } from "./conversationMessage";
import { Products, TypeModels } from "./associate";
import ProductVariants from "./productvariants";

export interface ConversationMessageProductCardAttributes {
  id: string;
  conversation_message_id: string;
  link: string;
  variant_id: number;
  product_id: number;
}

export interface ConversationMessageProductCardCreationAttributes extends Omit<
  ConversationMessageProductCardAttributes,
  "id" | "created_at" | "updated_at"
> {}

export class ConversationMessageProductCard
  extends Model<
    ConversationMessageProductCardAttributes,
    ConversationMessageProductCardCreationAttributes
  >
  implements ConversationMessageProductCardAttributes
{
  declare id: string;
  declare conversation_message_id: string;
  declare link: string;
  declare variant_id: number;
  declare product_id: number;

  // Optional: reference to parent message
  declare conversation_message?: ConversationMessage;

  static associate(models: TypeModels) {
    ConversationMessageProductCard.belongsTo(models.ConversationMessage, {
      foreignKey: "conversation_message_id",
      as: "conversation_message",
    });
    ConversationMessageProductCard.hasOne(models.ConversationMessageImage, {
      foreignKey: "card_id",
      as: "image",
    });
    ConversationMessageProductCard.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    ConversationMessageProductCard.belongsTo(models.ProductVariants, {
      foreignKey: "variant_id",
      as: "variant",
    });
  }
}

ConversationMessageProductCard.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_message_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ConversationMessage,
        key: "id",
      },
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductVariants,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Products,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "ConversationMessageProductCard",
    tableName: "ConversationMessageProductCards",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
