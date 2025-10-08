import express from "express";
import {
  GetShopByTokenController,
  ShopDeleteController,
  ShopLoginController,
  ShopRegisterController,
} from "../controller/shop.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  loginShopSchema,
  registerShopSchema,
} from "../validators/shopValidators";
import { authGuard } from "../middleware/authGuard";

const router = express.Router();

router.post(
  "/register",
  authGuard,
  validateRequest(registerShopSchema),
  ShopRegisterController
);

router.post("/login", validateRequest(loginShopSchema), ShopLoginController);

router.get("/", GetShopByTokenController);
router.delete("/", ShopDeleteController);

export default router;
