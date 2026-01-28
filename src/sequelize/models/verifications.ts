import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../db";

export interface IVerificationAttributes {
  id: string; // UUID
  email: string;
  otp: string; // 6-digit OTP code
  attempts: number; // Current failed attempts
  max_attempts: number; // Maximum allowed attempts
  expires_at: Date; // When OTP expires (ISO 8601 datetime)
  createdAt: Date;
  updatedAt: Date;
}
type PendingUserCreationAttributes = Optional<
  IVerificationAttributes,
  "id" | "createdAt" | "updatedAt" | "attempts" | "max_attempts"
>;
class Verifications
  extends Model<IVerificationAttributes, PendingUserCreationAttributes>
  implements IVerificationAttributes
{
  public id!: string;
  public email!: string;
  public otp!: string;
  public attempts!: number;
  public max_attempts!: number;
  public expires_at!: Date; // ✅ TYPE: Date (ISO 8601 datetime)
  public createdAt!: Date;
  public updatedAt!: Date;
}
Verifications.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },

    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      validate: {
        min: 1,
      },
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Verifications",
    tableName: "Verifications",
    timestamps: true,
    indexes: [
      {
        fields: ["email"],
        unique: true,
      },
      {
        fields: ["expires_at"],
        // For cleanup queries
      },
    ],
  },
);
export default Verifications;
