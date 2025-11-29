import Carts from "../sequelize/models/carts";
import ProductImages from "../sequelize/models/productimages";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import {
  AddCartItemPayload,
  CartItemDBPayload,
  DeleteCartItemPayload,
} from "../types/cart";
import { Response } from "express";
async function addCartItemService(data: AddCartItemPayload, res: Response) {
  const { productId, userId, variantId, productQuantity } = data;
  console.log("productQuantity", productQuantity);

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
        product_quantity: productQuantity,
      },
    });

    if (cartItem) {
      // if exists, increment quantity by 1
      cartItem.product_quantity += 1;
      await cartItem.save();
      return cartItem;
    }
    //otherwise create new cart item
    await Carts.create({
      product_id: productId,
      user_id: userId,
      product_variant_id: variantId,
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
async function deleteCartItemService(
  data: DeleteCartItemPayload,
  res: Response
) {
  const { productId, userId, removeCompletely } = data;

  try {
    // find the cart item
    const cartItem = await Carts.findOne({
      where: {
        product_id: productId,
        user_id: userId,
      },
    });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    if (removeCompletely) {
      // remove cart item completely
      await cartItem.destroy();
      return cartItem;
    }
    // decriment quantity by 1
    //  if quantity is greater than 1 decriment else remove item completely
    if (cartItem.product_quantity > 1) {
      cartItem.product_quantity -= 1;
      await cartItem.save();
      return cartItem;
    } else {
      await cartItem.destroy();
      return cartItem;
    }
  } catch (error) {
    console.error("deleteCartItemService error:", error);
    throw new Error("Failed to delete cart item");
  }
}
async function getCartService(userId: number, res: Response) {
  try {
    console.log("Fetching cart items for user:", userId);
    // fetch all cart items for user
    const cartItems = await Carts.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["id", "product_quantity"],

      include: [
        {
          model: Products,
          as: "product",
          attributes: ["id", "product_name", "product_price", "product_image"],
        },
        {
          model: ProductVariants,
          required: false,
          as: "variant",
          attributes: ["id", "variant_name", "variant_price"],
          include: [
            {
              model: ProductImages,
              as: "images",
              attributes: ["id", "image"],
              required: false,
            },
          ],
        },
      ],
    });

    // map cart items to include product and variant details.
    // if variant exists, use variant details else use product details

    return cartItems.map((item) => ({
      id: item.id,
      productId: item.product.id,
      variantId: item.variant ? item.variant.id : null,
      productName: item.variant
        ? item.variant.variantName
        : item.product.product_name,
      productImage: item.variant
        ? item.variant.images?.[0]?.image || item.product.product_image // Fallback if no variant image
        : item.product.product_image,
      productQuantity: item.product_quantity,
      productPrice: item.variant
        ? item.variant.variantPrice
        : item.product.product_price,
    }));
  } catch (error) {
    console.error("getCartService error:", error);
    throw new Error("Failed to fetch cart items");
  }
}

export { addCartItemService, deleteCartItemService, getCartService };
