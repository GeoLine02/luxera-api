import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./db";
import userRoutes from "./routes/user.routes";
import productsRoutes from "./routes/products.routes";
import categoriesRoutes from "./routes/categories.routes";
import shopRoutes from "./routes/shop.routes";
import cartRoutes from "./routes/cart.routes";
import path from "path";
import cookieParser from "cookie-parser";
import { initAssociations } from "./sequelize/models/associate";
import swaggerRouter from "./swagger/swagger";
import cityRoutes from "./routes/city.routes";
import sellerRoutes from "./seller/routes/seller.routes";
import errorHandler from "./middleware/errorHandler";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
export const s3 = new S3Client({
  region: process.env.S3_REGION || "hel1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT || "https://hel1.your-objectstorage.com",
  forcePathStyle: true,
});

// ✅ Middleware (must come before routes)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PROD_FRONTEND_URL
        : "http://localhost:3000", // ✅ Frontend URL
    credentials: true, // ✅ Allow cookies/authorization headers
  }),
);

app.use(express.json()); // handles JSON requests
app.use(express.urlencoded({ extended: true })); // handles URL-encoded form data
app.use(cookieParser());
// ✅ Routes

app.use("/user", userRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/shop", shopRoutes);
app.use("/cart", cartRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/seller", sellerRoutes);
app.use("/cities", cityRoutes);

// ✅ Swagger Documentation Route
app.use("/api-docs", swaggerRouter);
// ✅ Database connection
(async () => {
  try {
    await sequelize.authenticate();
    initAssociations();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
app.use(errorHandler);
// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
