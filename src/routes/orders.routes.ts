import e from "express";
import {
  createOrderController,
  GetOrderDetailsController,
  getShopOrderDetailsController,
  getShopOrdersController,
  getUserOrdersController,
} from "../controller/order.controller";
import { authGuard, shopAuthGuard } from "../middleware/authGuard";
import { validateRequest } from "../middleware/validateRequest";
import { CreateOrderSchema } from "../validators/orderValidator";
const router = e.Router();

router.post(
  "/create",
  authGuard,
  validateRequest(CreateOrderSchema),
  createOrderController,
);
router.get("/", authGuard, getUserOrdersController);
router.get("/:orderId", authGuard, GetOrderDetailsController);

export default router;
