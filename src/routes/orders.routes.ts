import e from "express";
import { createOrderController } from "../controller/order.controller";
import { authGuard } from "../middleware/authGuard";
import { validateRequest } from "../middleware/validateRequest";
import { CreateOrderSchema } from "../validators/orderValidator";
const router = e.Router();

router.post(
  "/create",
  authGuard,
  validateRequest(CreateOrderSchema),
  createOrderController,
);

export default router;
