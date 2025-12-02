import express from "express";
import {
  AllProductsController,
  FeaturedProductsController,
  VipProductsController,
  SearchProductsController,
  GetProductByIdController,
} from "../controller/products.controller";

const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);
router.get("/search", SearchProductsController);
router.get("/:id", GetProductByIdController);

export default router;
