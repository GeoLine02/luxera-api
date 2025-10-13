import express from "express";
import {
  GetAllCategoriesController,
  GetAllSubCategoriesController,
} from "../controller/categories.controller";
import { authGuard } from "../middleware/authGuard";
import upload from "../middleware/upload";
import { CreateProductController } from "../controller/products.controller";

const router = express.Router();

router.get("/", GetAllCategoriesController);
router.get("/subCategories", GetAllSubCategoriesController);

export default router;
