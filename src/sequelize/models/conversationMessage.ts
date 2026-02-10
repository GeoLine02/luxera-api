import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { Conversation } from "./conversation";
import { TypeModels } from "./associate";
import { ConversationMessageProductCard } from "./conversationMessageProductCards";
import { ProductAttributes } from "./products";
import { ProductVariantsAttributes } from "./productvariants";
import {
  ConversationMessageImage,
  ConversationMessageImageAttributes,
} from "./conversationMessageImages";
import ProductImages, { ProductImageAttributes } from "./productimages";

export interface ConversationMessageAttributes {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
}
export type ConversationMessageDetails = ConversationMessageAttributes & {
  product_cards: Array<
    ConversationMessageProductCard & {
      product: ProductAttributes;
      variant: ProductVariantsAttributes;
      image: ConversationMessageImageAttributes & {
        image: ProductImageAttributes;
      };
    }
  >;
};
export interface ConversationMessageCreationAttributes extends Omit<
  ConversationMessageAttributes,
  "id" | "created_at" | "updated_at"
> {}

// Message class
export class ConversationMessage
  extends Model<
    ConversationMessageAttributes,
    ConversationMessageCreationAttributes
  >
  implements ConversationMessageAttributes
{
  declare id: string;
  declare conversation_id: string;
  declare role: "user" | "assistant";
  declare content: string;
  declare metadata?: Record<string, any>;
  declare product_cards?: ConversationMessageProductCard[];
  // Optional: reference to parent conversation
  declare conversation?: Conversation;
  static associate(models: TypeModels) {
    ConversationMessage.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      as: "conversation",
    });
    ConversationMessage.hasMany(models.ConversationMessageProductCard, {
      foreignKey: "conversation_message_id",
      as: "product_cards",
    });
    ConversationMessage.hasMany(models.ConversationMessageImage, {
      foreignKey: "conversation_message_id",
      as: "images",
    });
  }
}

// Initialize
ConversationMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Conversation,
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "ConversationMessage",
    tableName: "ConversationMessages",
    timestamps: true,
  },
);

// ────────────────────────────────────────────────
// Associations (same as before, but now on classes)
