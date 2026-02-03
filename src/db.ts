import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import cls from "cls-hooked";
import { fa } from "zod/v4/locales";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const namespace = cls.createNamespace("my-app");
Sequelize.useCLS(namespace);

// Common pool configuration
const poolConfig = {
  max: 20, // Maximum number of connections
  min: 2, // Minimum number of connections
  acquire: 30000, // Timeout for acquiring a connection (30s)
  idle: 10000, // Idle timeout before connection is released (10s)
};

const commonConfig = {
  pool: poolConfig,
  dialectOptions: {
    statement_timeout: 30000, // Query timeout (30s)
  },
};

const sequelize = isProduction
  ? new Sequelize(process.env.INTERNAL_DB_URL!, {
      dialect: "postgres",
      protocol: "postgres",
      ...commonConfig,
      dialectOptions: {
        ...commonConfig.dialectOptions,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME!,
      process.env.DB_USERNAME!,
      process.env.DB_PASSWORD!,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false, // enable SQL logs in development
        ...commonConfig,
      },
    );

export default sequelize;
