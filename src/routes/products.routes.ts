import express from "express";
import {
  AllProductsController,
  FeaturedProductsController,
  VipProductsController,
} from "../controller/products.controller";
const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);

export default router;
