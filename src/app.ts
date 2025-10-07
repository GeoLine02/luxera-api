import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./db";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Middleware (must come before routes)
app.use(cors());
app.use(express.json()); // handles JSON requests
app.use(express.urlencoded({ extended: true })); // handles URL-encoded form data

// ✅ Routes
app.use("/user", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express!");
});

// ✅ Database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
