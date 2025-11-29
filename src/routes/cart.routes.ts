import e from "express";
import {
  addCartItemController,
  changeCartItemQuantityController,
  deleteCartItemController,
  getCartController,
} from "../controller/cart.controller";
import { validateRequest } from "../middleware/validateRequest";
import { AddcartItemSchema } from "../validators/cartValidators";

const router = e.Router();

// POST /api/cart - Add item to cart
router.post("/", validateRequest(AddcartItemSchema), addCartItemController);

// DELETE /api/cart - Delete or decrement item from cart
router.delete("/:id", deleteCartItemController);

// GET /api/cart/:userId - Get cart items for a user
router.get("/:userId", getCartController);
router.put("/:productId", changeCartItemQuantityController);

export default router;
