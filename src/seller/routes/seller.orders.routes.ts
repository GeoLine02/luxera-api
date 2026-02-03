import e from "express";
import { authGuard, shopAuthGuard } from "../../middleware/authGuard";
import {
  getShopOrderDetailsController,
  getShopOrdersController,
} from "../../controller/order.controller";
const router = e.Router();

router.get("/", authGuard, shopAuthGuard, getShopOrdersController);
router.get(
  "/:orderId",
  authGuard,
  shopAuthGuard,
  getShopOrderDetailsController,
);
export default router;
