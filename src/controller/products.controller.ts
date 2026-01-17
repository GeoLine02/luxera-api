import { Request, Response } from "express";
import {
  AllProductsService,
  CreateProductService,
  FeaturedProductsService,
  GetProductByIdService,
  GetProductsBySubCategoryService,
  getSellerProductsService,
  SearchProductsService,
  VipProductsService,
} from "../services/product.service";
import { ValidationError } from "../errors/errors";
import logger from "../logger";
import { paginatedResponse } from "../utils/responseHandler";

export async function AllProductsController(req: Request, res: Response) {
  const { hasMore, integerPage, productsWithImages } = await AllProductsService(
    req,
    res,
  );

  return paginatedResponse(
    res,
    "Fetched Products",
    productsWithImages,
    hasMore,
    integerPage,
  );
}

export async function VipProductsController(req: Request, res: Response) {
  try {
    await VipProductsService(req, res);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function FeaturedProductsController(req: Request, res: Response) {
  try {
    await FeaturedProductsService(req, res);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function CreateProductController(req: Request, res: Response) {
  try {
    console.log(req.body);
    const createdProduct = await CreateProductService(req, res);
    return createdProduct;
  } catch (error) {
    console.log(error);
  }
}

export async function SearchProductsController(req: Request, res: Response) {
  try {
    await SearchProductsService(req, res);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function GetProductByIdController(req: Request, res: Response) {
  const product = await GetProductByIdService(req, res);
  return product;
}
export async function GetProductsBySubCategoryController(
  req: Request,
  res: Response,
) {
  // Parse and validate inputs individually for precise error messages
  const { page: pageQuery, subcategory } = req.query;

  const errors: Array<{ field: string; message: string }> = [];

  // Validate subcategory
  if (
    !subcategory ||
    typeof subcategory !== "string" ||
    subcategory.trim() === ""
  ) {
    logger.error("Invalid subcategory name");
    errors.push({
      field: "subcategory",
      message: "Subcategory name is required and must be a non-empty string",
    });
  }

  // Validate page
  const page = Number(pageQuery);
  if (!pageQuery || isNaN(page) || page < 1 || !Number.isInteger(page)) {
    errors.push({
      field: "page",
      message: "Page must be a positive integer",
    });
  }

  // Only throw if there are actual errors
  if (errors.length > 0) {
    throw new ValidationError(errors, "Invalid request parameters");
  }

  // Now we know these are valid
  const paginatedResult = await GetProductsBySubCategoryService(
    subcategory as string,
    page,
    res,
  );

  return paginatedResult;
}
