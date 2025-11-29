import e from "express";
import { Request, Response } from "express";
import {
  addCartItemController,
  deleteCartItemController,
  getCartController,
} from "../controller/cart.controller";
import { validateRequest } from "../middleware/validateRequest";
import { AddcartItemSchema, DeleteCartItemSchema } from "../validators/cartValidators";

const router = e.Router();



// POST /api/cart - Add item to cart
router.post("/", validateRequest(AddcartItemSchema), addCartItemController);

// DELETE /api/cart - Delete or decrement item from cart
router.delete(
  "/",
  validateRequest(DeleteCartItemSchema),
  deleteCartItemController
);

// GET /api/cart/:userId - Get cart items for a user
router.get("/:userId", getCartController);

export default router;
