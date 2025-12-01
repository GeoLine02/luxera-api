import express from "express";
import {
  AllProductsController,
  FeaturedProductsController,
  VipProductsController,
  SearchProductsController,
  GetProductByIdController,
  CreateProductController,
} from "../controller/products.controller";
import { authGuard, shopAuthGuard } from "../middleware/authGuard";
import upload from "../middleware/upload";
import { validateRequest } from "../middleware/validateRequest";
import { DeleteProductController } from "../seller/controller/seller.products.controller";
import { ProductCreationSchema } from "../validators/productValidators";

const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);
router.get("/search", SearchProductsController);
router.get("/:id", GetProductByIdController);
router.post(
  "/",
  authGuard,
  shopAuthGuard,
  upload.any(),
  validateRequest(ProductCreationSchema),
  CreateProductController
);

router.delete("/delete", DeleteProductController);

export default router;
