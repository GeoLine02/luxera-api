import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import cls from "cls-hooked";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const namespace = cls.createNamespace("my-app");
Sequelize.useCLS(namespace);
const sequelize = isProduction
  ? new Sequelize(process.env.INTERNAL_DB_URL!, {
      dialect: "postgres",
      protocol: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Render requires this
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME_DEVELOPMENT!,
      process.env.DB_USERNAME!,
      process.env.DB_PASSWORD!,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: console.log, // enable SQL logs in development
      }
    );

export default sequelize;
