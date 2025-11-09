import { Request, Response } from "express";
import {
  AllProductsService,

  FeaturedProductsService,
  SearchProductsService,

  // UpdateProductService,
  VipProductsService,
} from "../services/product.service";
import zod from "zod"
import { ProductUpdatePayload } from "../types/products";

export async function AllProductsController(req: Request, res: Response) {
  try {
    const products = await AllProductsService();

    return res.status(200).json(products);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while fetching products",
      error: error.message,
    });
  }
}

export async function VipProductsController(req: Request, res: Response) {
  try {
    const vipProducts = await VipProductsService();

    return res.status(200).json(vipProducts);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function FeaturedProductsController(req: Request, res: Response) {
  try {
    const feturedProducts = await FeaturedProductsService();

    return res.status(200).json(feturedProducts);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}


export async function SearchProductsController(req: Request, res: Response) {
  try {
    const query = req.query.q as string;

    const searchResults = await SearchProductsService(query);
    console.log(searchResults);
    return res.status(200).json(searchResults);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
