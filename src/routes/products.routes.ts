import express from "express";
import {
  AllProductsController,
  CreateProductController,
  DeleteProductController,
  FeaturedProductsController,
  // UpdateProductController,
  VipProductsController,
  SearchProductsController,
  UpdateProductController,
} from "../controller/products.controller";
import { authGuard, shopAuthGuard } from "../middleware/authGuard";
import upload from "../middleware/upload";
import { validateRequest } from "../middleware/validateRequest";
import {
  ProductCreationSchema,
  ProductVariantSchema,
} from "../validators/productValidators";
const router = express.Router();

router.get("/", AllProductsController);
router.get("/vip", VipProductsController);
router.get("/featured", FeaturedProductsController);
router.post(
  "/create",
  authGuard,
  shopAuthGuard,
  upload.any(),
  validateRequest(ProductCreationSchema),
  CreateProductController
);
router.put(
  "/update",
  authGuard,
  upload.any(),
  validateRequest(ProductCreationSchema),
  UpdateProductController
);
router.get("/search", SearchProductsController);
router.delete("/delete", DeleteProductController);
router.get("/:id", GetProductByIdController);

export default router;
