import express from "express";
import {
  AllProductsController,
  CreateProductController,
  DeleteProductController,
  FeaturedProductsController,
  // UpdateProductController,
  VipProductsController,
  SearchProductsController,
} from "../controller/products.controller";
import { authGuard } from "../middleware/authGuard";
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
router.post("/create", authGuard, upload.any(), CreateProductController);
// router.put(
//   "/update",
//   authGuard,
//   upload.array("images"),
//   // UpdateProductController
// );
router.get("/search", SearchProductsController);
router.delete("/delete", DeleteProductController);

export default router;
