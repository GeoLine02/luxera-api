import { Request, Response } from "express";
import {
  AllProductsService,
  CreateProductService,
  FeaturedProductsService,
  GetProductByIdService,
  SearchProductsService,
  VipProductsService,
} from "../services/product.service";

export async function AllProductsController(req: Request, res: Response) {
  try {
    const products = await AllProductsService(req, res);
    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function VipProductsController(req: Request, res: Response) {
  try {
    const vipProducts = await VipProductsService(req, res);
    return vipProducts;
  } catch (error) {
    console.log(error);
  }
}
export async function FeaturedProductsController(req: Request, res: Response) {
  try {
    const featuredProducts = await FeaturedProductsService(req, res);
    return featuredProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function CreateProductController(req: Request, res: Response) {
  try {
    console.log(req.files);
    console.log(req.body);
    const createdProduct = await CreateProductService(req, res);
    return createdProduct;
  } catch (error) {
    console.log(error);
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
    const product = await GetProductByIdService(req, res);
    return product;
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
