import express from "express";
import {
  AllProductsController,
  VipProductsController,
} from "../controller/products.controller";
const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);

export default router;
