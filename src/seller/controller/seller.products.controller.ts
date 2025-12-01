import { Request, Response } from "express";
import {
  DeleteProductService,
  GetSellerProductsService,
  UpdateProductService,
} from "../services/seller.products.service";
export async function getSellerProductsController(req: Request, res: Response) {
  try {
    const sellertProducts = await GetSellerProductsService(req);
    return res.status(200).json({
      success: true,
      message: "Seller products fetched successfully",
      data: sellertProducts,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function DeleteProductController(req: Request, res: Response) {
  try {
    const productId = req.params.id as string;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const deletedProduct = await DeleteProductService(Number(productId), res);
    return res.status(204).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
