import express from "express";
import {
  GetAllCategoriesController,
  GetAllSubCategoriesController,
} from "../controller/categories.controller";

const router = express.Router();

router.get("/", GetAllCategoriesController);
router.get("/subCategories", GetAllSubCategoriesController);

export default router;
