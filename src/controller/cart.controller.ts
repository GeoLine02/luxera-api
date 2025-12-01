import { Request, Response } from "express";
import { AddCartItemPayload, DeleteCartItemPayload } from "../types/cart";
import {
  addCartItemService,
  changCartItemQuantityService,
  deleteCartItemService,
  getCartService,
} from "../services/cart.service";
import { success } from "zod";

async function addCartItemController(req: Request, res: Response) {
  const body = req.body as AddCartItemPayload;

  try {
    const cartItem = await addCartItemService(body, res);
    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cartItem,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteCartItemController(req: Request, res: Response) {
  try {
    const deletedProduct = await deleteCartItemService(req, res);
    return deletedProduct;
  } catch (error) {
    console.log(error);
  }
}

async function getCartController(req: Request, res: Response) {
  try {
    const cartItems = await getCartService(req, res);
    return cartItems;
  } catch (error) {
    console.log(error);
  }
}

async function changeCartItemQuantityController(req: Request, res: Response) {
  try {
    const updatedItem = await changCartItemQuantityService(req, res);
    return updatedItem;
  } catch (error) {
    console.log(error);
  }
}

export {
  addCartItemController,
  deleteCartItemController,
  getCartController,
  changeCartItemQuantityController,
};
