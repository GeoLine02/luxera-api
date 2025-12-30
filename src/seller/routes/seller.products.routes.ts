import express from "express";
import { authGuard, shopAuthGuard } from "../../middleware/authGuard";
import upload from "../../middleware/upload";
import { validateRequest } from "../../middleware/validateRequest";
import {
  ProductCreationSchema,
  ProductUpdateSchema,
  ProductUpdateStatusSchema,
} from "../../validators/productValidators";
import {
  CreateProductController,
  DeleteProductController,
  getSellerProductByIdController,
  getSellerProductsController,
  UpdateProductController,
  UpdateProductStatusController,
} from "../controller/seller.products.controller";

const router = express.Router();
router.get("/", authGuard, shopAuthGuard, getSellerProductsController);
router.post(
  "/create",
  authGuard,
  shopAuthGuard,
  upload.any(),
  validateRequest(ProductCreationSchema),
  CreateProductController
);
router.get("/:id", authGuard, shopAuthGuard, getSellerProductByIdController);

router.patch(
  "/update",
  authGuard,
  shopAuthGuard,
  upload.any(),
  validateRequest(ProductUpdateSchema),
  UpdateProductController
);

router.delete("/:id", authGuard, shopAuthGuard, DeleteProductController);
router.put(
  "/updateStatus",
  authGuard,
  shopAuthGuard,
  validateRequest(ProductUpdateStatusSchema),
  UpdateProductStatusController
);

export default router;
