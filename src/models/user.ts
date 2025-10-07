import sequelize from "../db";
import { Model, DataTypes } from "sequelize";

class User extends Model {
  declare id: number;
  declare full_name: string;
  declare email: string;
  declare password: string;

  // Add association declarations if needed
  // static associate(models: any) {}
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true,
  }
);

export default User;
