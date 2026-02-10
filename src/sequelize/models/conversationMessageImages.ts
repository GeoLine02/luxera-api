import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { ConversationMessage } from "./conversationMessage";
import { TypeModels } from "./associate";
import ProductImages from "./productimages";
import { ConversationMessageProductCard } from "./conversationMessageProductCards";

export interface ConversationMessageImageAttributes {
  id: string;
  conversation_message_id: string;
  image_id: number;
  card_id: string;
}

export interface ConversationMessageImageCreationAttributes extends Omit<
  ConversationMessageImageAttributes,
  "id" | "created_at" | "updated_at"
> {}

export class ConversationMessageImage
  extends Model<
    ConversationMessageImageAttributes,
    ConversationMessageImageCreationAttributes
  >
  implements ConversationMessageImageAttributes
{
  declare id: string;
  declare conversation_message_id: string;
  declare image_id: number;
  declare card_id: string; // New field for product card association

  // Optional: reference to parent message
  declare conversation_message?: ConversationMessage;
  static associate(models: TypeModels) {
    ConversationMessageImage.belongsTo(models.ConversationMessage, {
      foreignKey: "conversation_message_id",
      as: "conversation_message",
    });
    ConversationMessageImage.belongsTo(models.ConversationMessageProductCard, {
      foreignKey: "card_id",
      as: "product_card",
    });
    ConversationMessageImage.belongsTo(models.ProductImages, {
      foreignKey: "image_id",
      as: "image",
    });
  }
}

ConversationMessageImage.init(
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
      onDelete: "CASCADE",
    },
    image_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductImages,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    card_id: {
      references: {
        model: ConversationMessageProductCard,
        key: "id",
      },
      type: DataTypes.UUIDV4,
      allowNull: false,
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "ConversationMessageImage",
    tableName: "ConversationMessageImages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
