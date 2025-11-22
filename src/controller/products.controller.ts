import { Request, Response } from "express";
import {
  AllProductsService,

  FeaturedProductsService,
  GetProductByIdService,
  SearchProductsService,


  VipProductsService,
} from "../services/product.service";
import { success } from "zod";
import Products from "../sequelize/models/products";
export async function AllProductsController(req: Request, res: Response) {
const page = Number(req.query.page)
const pageSize = Number(req.query.pageSize)
console.log(page,pageSize)
if (isNaN(page) || page < 0 || isNaN(pageSize) || pageSize <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid query parameters"
  });
}
  try {
    const products = await AllProductsService(page,pageSize);
     const totalCount = await Products.count()
     const hasMore = totalCount > page * pageSize + products.length
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      page:page,
      pageSize:pageSize,
      hasMore:hasMore   
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
  const page = Number(req.query.page)
const pageSize = Number(req.query.pageSize)
if (isNaN(page) || page < 0 || isNaN(pageSize) || pageSize <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid query parameters"
  });
}
  try {
    const vipProducts = await VipProductsService(page,pageSize);
    const totalCount = await Products.count()
    const hasMore = totalCount > page * pageSize + vipProducts.length
    return res.status(200).json({
      success: true,
      message: "VIP products fetched successfully",
      data: vipProducts,
      hasMore:hasMore,
      page:page,
      pageSize:pageSize
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
    const page = Number(req.query.page)
const pageSize = Number(req.query.pageSize)
if (isNaN(page) || page < 0 || isNaN(pageSize) || pageSize <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid query parameters"
  });
}
  try {

    const featuredProducts = await FeaturedProductsService(page,pageSize);
    const totalCount = await Products.count()
    const hasMore = totalCount > page * pageSize + featuredProducts.length
    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: featuredProducts,
      hasMore,
      page,
      pageSize
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

