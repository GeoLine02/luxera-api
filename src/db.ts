import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

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
      logging: console.log, // disable SQL logs in production server
    })
  : new Sequelize(
      process.env.DB_NAME_DEVELOPMENT!,
      process.env.DB_USERNAME!,
      process.env.DB_PASSWORD!,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false, // enable SQL logs in development
      }
    );

export default sequelize;
