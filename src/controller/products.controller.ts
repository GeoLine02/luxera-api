import { Request, Response } from "express";
import {
  AllProductsService,

  FeaturedProductsService,
  GetProductByIdService,
  SearchProductsService,


  VipProductsService,
} from "../services/product.service";
import { success } from "zod";
export async function AllProductsController(req: Request, res: Response) {
  try {
    const products = await AllProductsService();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function VipProductsController(req: Request, res: Response) {
  try {
    const vipProducts = await VipProductsService();

    return res.status(200).json({
      success: true,
      message: "VIP products fetched successfully",
      data: vipProducts,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success:false,
      message:error.message
    });
  }
}

export async function FeaturedProductsController(req: Request, res: Response) {
  try {
    const feturedProducts = await FeaturedProductsService();

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: feturedProducts,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}



export async function SearchProductsController(req: Request, res: Response) {
  try {
    const query = req.query.q as string;

    const searchResults = await SearchProductsService(query);
    console.log(searchResults);
    return res.status(200).json({
      success: true,
      message: "Products search completed successfully",
      data: searchResults,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
export async function GetProductByIdController(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    
    const product = await GetProductByIdService(Number(productId), res);
    console.log(product);
    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

