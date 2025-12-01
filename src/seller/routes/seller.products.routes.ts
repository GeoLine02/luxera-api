import express from "express";
import { authGuard, shopAuthGuard } from "../../middleware/authGuard";
import upload from "../../middleware/upload";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductCreationSchema } from "../../validators/productValidators";
import {
  DeleteProductController,
  getSellerProductsController,
} from "../controller/seller.products.controller";

const router = express.Router();
router.get("/", authGuard, shopAuthGuard, getSellerProductsController);

router.delete("/:id", authGuard, shopAuthGuard, DeleteProductController);

export default router;
