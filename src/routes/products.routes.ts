import express from "express";
import {
  AllProductsController,

  FeaturedProductsController,
  // UpdateProductController,
  VipProductsController,
  SearchProductsController,
} from "../controller/products.controller";

const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);
router.get("/search", SearchProductsController);



export default router;
