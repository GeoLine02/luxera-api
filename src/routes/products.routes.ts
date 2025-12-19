import express from "express";
import {
  AllProductsController,
  FeaturedProductsController,
  VipProductsController,
  SearchProductsController,
  GetProductByIdController,
  GetProductsBySubCategoryController,
  getSellerProductsController,
} from "../controller/products.controller";

const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);
router.get("/search", SearchProductsController);
router.get("/seller", getSellerProductsController);
router.get("/subcategory", GetProductsBySubCategoryController);
router.get("/:id", GetProductByIdController);

export default router;
