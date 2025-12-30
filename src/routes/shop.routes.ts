import express from "express";
import {
  getShopByIdController,
  GetShopByTokenController,
  RefreshShopAccessTokenController,
  ShopDeleteController,
  ShopLoginController,
  ShopRegisterController,
  updateShopLocationController,
} from "../controller/shop.controller";

import {
  loginShopSchema,
  registerShopSchema,
} from "../validators/shopValidators";
import { authGuard, shopAuthGuard } from "../middleware/authGuard";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

router.post(
  "/register",
  authGuard,
  validateRequest(registerShopSchema),
  ShopRegisterController
);
router.post("/login", authGuard, ShopLoginController);
router.get("/refresh", RefreshShopAccessTokenController);
router.get("/", authGuard, shopAuthGuard, GetShopByTokenController);
router.get("/:shopId", authGuard, getShopByIdController);
router.delete("/", authGuard, shopAuthGuard, ShopDeleteController);
router.patch(
  "/location",
  authGuard,
  shopAuthGuard,
  updateShopLocationController
);

export default router;
