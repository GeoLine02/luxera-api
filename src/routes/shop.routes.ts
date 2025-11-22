import express from "express";
import {
  GetShopByTokenController,
  RefreshShopAccessTokenController,
  ShopDeleteController,
  ShopLoginController,
  ShopRegisterController,
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
router.get("/",authGuard,shopAuthGuard,  GetShopByTokenController);
router.delete("/",authGuard,shopAuthGuard, ShopDeleteController);

export default router;
