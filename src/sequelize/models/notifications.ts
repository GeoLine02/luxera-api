import { DataTypes, Model, Optional } from "sequelize";
import { TypeModels } from "./associate";
import { NotificationType } from "../../constants/enums";
import sequelize from "../../db";
import e from "express";

interface NotificationAttributes {
  id: number;
  recipient_id: number;
  message: string;
  notification_type: string;
  product_id: number;
  shop_id: number;
  read: boolean;
  read_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    "id" | "read" | "read_at" | "createdAt" | "updatedAt"
  > {}
class Notifications
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: number;
  declare recipient_id: number;
  declare message: string;
  declare notification_type: string;
  declare product_id: number;
  declare read: boolean;
  declare read_at: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare shop_id: number;
  static associate(models: TypeModels) {
    Notifications.belongsTo(models.User, {
      foreignKey: "recipient_id",
      as: "recipient",
    });
    Notifications.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    Notifications.belongsTo(models.Shop, {
      foreignKey: "shop_id",
      as: "shop",
    });
  }
  async markAsRead(): Promise<void> {
    if (!this.read) {
      this.read = true;
      this.read_at = new Date();
      await this.save();
    }
  }

  async markAsUnread(): Promise<void> {
    if (this.read) {
      this.read = false;
      this.read_at = null;
      await this.save();
    }
  }
}
Notifications.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notification_type: {
      type: DataTypes.ENUM(
        NotificationType.ProductApproved,
        NotificationType.ProductRejected,
        NotificationType.AccountWarning,
        NotificationType.SystemAnnouncement
      ),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
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
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Notifications",
  }
);
export default Notifications;
