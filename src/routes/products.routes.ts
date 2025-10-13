import express from "express";
import {
  AllProductsController,
  CreateProductController,
  DeleteProductController,
  FeaturedProductsController,
  UpdateProductController,
  VipProductsController,
} from "../controller/products.controller";
import { authGuard } from "../middleware/authGuard";
import upload from "../middleware/upload";
const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);
router.post(
  "/create",
  authGuard,
  upload.array("images"),
  CreateProductController
);
router.put(
  "/update",
  authGuard,
  upload.array("images"),
  UpdateProductController
);

router.delete("/delete", DeleteProductController);

export default router;
