
import { Request,Response } from "express";
import { AddCartItemPayload, DeleteCartItemPayload } from "../types/cart";
import { addCartItemService, deleteCartItemService, getCartService } from "../services/cart.service";
import { success } from "zod";

 async function addCartItemController(req:Request,res:Response){
    const  body = req.body as AddCartItemPayload
 
     
    try {
  
     const cartItem =  await addCartItemService(body,res)
        return res.status(200).json({
            success:true,
            message:"Item added to cart successfully",
            data:cartItem
        })

    } catch (error:any) {
         return res.status(500).json({
            success:false,
            message:error.message
         })
    }
    
}

 async function deleteCartItemController(req:Request,res:Response){
    const body = req.body  as DeleteCartItemPayload
    

    try {
       await deleteCartItemService(body,res)
        return res.status(204).json({
            success:true,
            message:"Item removed from cart successfully",
            data: null
        })
    } catch (error : any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
  


}
 async function getCartController(req:Request,res:Response){
   const userId = req.params.userId as string
   try {
       const cartItems = await getCartService(Number(userId),res)
       return res.status(200).json({
        success:true,
        message:"Cart items retrieved successfully",
        data:cartItems
       })
   } catch (error: any) {
    return res.status(500).json({
        success:false,
        message:error.message
     })
   }
  
}
export {addCartItemController,deleteCartItemController,getCartController}