import Carts from "../sequelize/models/carts";
import ProductImages from "../sequelize/models/productimages";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import { AddCartItemPayload, CartItemDBPayload, DeleteCartItemPayload } from "../types/cart";
import { Request,Response } from "express";
async function addCartItemService(data:AddCartItemPayload,res:Response){
    const {productId,userId,variantId} = data

    try {
  // check if product exist in the db
    const product = await Products.findOne({
        where:{
            id:productId
        },
        include:{
            model:ProductVariants,
            as:"variants",
            where:{
                id:variantId
            }
        }
    })

    if(!product){
        return res.status(404).json({
            success:false,
            message:"Product or Variant not found"
        })
    }
                   // find if cart item already exists for user
    const cartItem = await Carts.findOne({
        where:{
            product_id:productId,
            user_id:userId,
            product_variant_id: variantId,
        }
    })

    if(cartItem){
        // if exists, increment quantity by 1
         cartItem.product_quantity+=1
         await cartItem.save()
         return cartItem
    }
    //otherwise create new cart item
    await Carts.create({
        product_id:productId,
        user_id:userId,
        product_variant_id: variantId,
    })

    const newCartItem = await Carts.findOne({
        where:{
            product_id:productId,
            user_id:userId
        }
    })
    return newCartItem
    } catch (error : any ) {
        console.error("addCartItemService error:", error);
         throw new Error("Failed to add item to cart")
    }
}
async function deleteCartItemService(data:DeleteCartItemPayload,res:Response){
    const {productId,userId,removeCompletely} = data 
    
    try {
        // find the cart item
    const cartItem = await Carts.findOne({
        where:{
            product_id:productId,
            user_id:userId
        }
    })
    if(!cartItem){
       return res.status(404).json({
            success:false,
            message:"Cart item not found"
       })
    }
    if(removeCompletely){
        // remove cart item completely
        await cartItem.destroy()
        return cartItem
        
    }
    // decriment quantity by 1
    //  if quantity is greater than 1 decriment else remove item completely
    if(cartItem.product_quantity>1){
       cartItem.product_quantity-=1
         await cartItem.save()
        return cartItem
    }else{
        await cartItem.destroy()
        return cartItem
    }
    } catch (error) {
        console.error("deleteCartItemService error:", error);
        throw new Error("Failed to delete cart item")
    }
}
async function getCartService(userId:number,res:Response){
  try {
    console.log("Fetching cart items for user:", userId);
    // fetch all cart items for user
    const cartItems = await Carts.findAll({
        where:{
            user_id:userId
        },
   
        include:[{

            model: Products,
            as: "product",
         
        },
    {

        model:ProductVariants,
        
        as:"variant",
        include:[{
            model:ProductImages,
            as:"images",
            attributes:['id','image'],
        }]
        },
     
    ]
    })

    return cartItems
  } catch (error) {
    console.error("getCartService error:", error);
     throw new Error("Failed to fetch cart items")
  }
}

export {addCartItemService,deleteCartItemService,getCartService}