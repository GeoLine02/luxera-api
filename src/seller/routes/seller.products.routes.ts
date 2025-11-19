import express from "express";
import { authGuard, shopAuthGuard } from "../../middleware/authGuard";
import upload from "../../middleware/upload";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductCreationSchema } from "../../validators/productValidators";
import { CreateProductController, DeleteProductController, getSellerProductsController, UpdateProductController } from "../controller/seller.products.controller";

const router = express.Router();
router.get("/",
  authGuard,
  shopAuthGuard,
  getSellerProductsController)
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
  shopAuthGuard,
  upload.any(),
  validateRequest(ProductCreationSchema),
  UpdateProductController
);


router.delete("/", 
    authGuard,
  shopAuthGuard,
  DeleteProductController);


export default router;