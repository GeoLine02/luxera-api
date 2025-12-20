import Carts from "../sequelize/models/carts";
import ProductImages from "../sequelize/models/productimages";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import {
  AddCartItemPayload,
  CartItemDBPayload,
  DeleteCartItemPayload,
} from "../types/cart";
import { Request, Response } from "express";
async function addCartItemService(data: AddCartItemPayload, res: Response) {
  const { productId, userId, variantId, quantity } = data;
  try {
    // check if product exist in the db
    const product = await Products.findOne({
      where: {
        id: productId,
      },
      include: {
        model: ProductVariants,
        as: "variants",
        where: {
          id: variantId,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product or Variant not found",
      });
    }
    // find if cart item already exists for user
    const cartItem = await Carts.findOne({
      where: {
        product_id: productId,
        user_id: userId,
        product_variant_id: variantId,
      },
    });

    if (cartItem) {
      // if exists, increment quantity by 1
      cartItem.product_quantity += quantity;
      await cartItem.save();
      return cartItem;
    }
    //otherwise create new cart item
    await Carts.create({
      product_id: productId,
      user_id: userId,
      product_variant_id: variantId,
      product_quantity: quantity,
    });

    const newCartItem = await Carts.findOne({
      where: {
        product_id: productId,
        user_id: userId,
      },
    });
    return newCartItem;
  } catch (error: any) {
    console.error("addCartItemService error:", error);
    throw new Error("Failed to add item to cart");
  }
}
async function deleteCartItemService(req: Request, res: Response) {
  const cartItemId = req.params.id;
  try {
    // find the cart item
    const cartItem = await Carts.findOne({
      where: {
        id: cartItemId,
      },
    });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const deletedCartItem = await Carts.destroy({
      where: {
        id: cartItemId,
      },
    });
    if (deletedCartItem) {
      return res.status(200).json({
        success: true,
        data: { itemId: cartItem.id },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete cart item",
    });
  }
}
async function getCartService(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const cartItems = await Carts.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Products,
          as: "product",
        },
        {
          model: ProductVariants,

          as: "variant",
          include: [
            {
              model: ProductImages,
              as: "images",
              attributes: ["id", "image"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
      error,
    });
  }
}

const changCartItemQuantityService = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const newQuantity = req.body.quantity;

    const existingItem = await Carts.findOne({
      where: {
        id: productId,
      },
    });

    if (!existingItem) {
      return res.status(400).json({
        success: false,
        message: `Cart item wiht id ${productId} does not exist`,
      });
    }

    const [success, returnedResult] = await Carts.update(
      { product_quantity: newQuantity },
      {
        where: {
          id: productId,
        },
        returning: true,
      }
    );

    return res.status(200).json({
      success: success === 1,
      data: returnedResult[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to changer product quantity",
      error,
    });
  }
};

export {
  addCartItemService,
  deleteCartItemService,
  getCartService,
  changCartItemQuantityService,
};
