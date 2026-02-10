// models/Conversation.ts

import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../../db";
import { TypeModels } from "./associate";
import { ConversationMessage } from "./conversationMessage";

// 1. Define the attributes interface (for TypeScript type safety)
export interface ConversationAttributes {
  id: string;
  user_id: number;
  title?: string | null;
}

export interface ConversationCreationAttributes extends Omit<
  ConversationAttributes,
  "id" | "created_at" | "updated_at"
> {}

// 2. Conversation class
export class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  declare id: string;
  declare user_id: number;
  declare title?: string | null;

  // Optional: relationships (added via associations below)
  declare messages?: ConversationMessage[];
  static associate(models: TypeModels) {
    Conversation.hasMany(models.ConversationMessage, {
      foreignKey: "conversation_id",
      as: "messages",
      onDelete: "CASCADE",
    });
    Conversation.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }

  // If you want instance methods or getters/setters, add them here
}

// 3. Initialize the model
Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Assuming you have a Users table
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize, // ← pass your sequelize instance here
    modelName: "Conversation",
    tableName: "Conversations",
    timestamps: true,
  },
);
