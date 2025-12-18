import { Request, Response } from "express";

import {
  CreateProductPayload,
  ExistingImages,
  ProductUpdatePayload,
  ProductUpdateStatusPayload,
  VariantImagesMap,
} from "../../types/products";

import { CreateSingleProductService } from "../services/products/seller.createSingleProduct";
import { CreateProductImagesService } from "../services/products/seller.createProductImages";
import ProductVariants from "../../sequelize/models/productvariants";
import { CreateProductVariantsService } from "../services/products/seller.createProductVariants";
import Products from "../../sequelize/models/products";
import { UpdateSingleProductService } from "../services/products/seller.updateSingleProduct";
import { UpdateProductVariantsService } from "../services/products/seller.updateProductVariants";
import { GetSellerProductsService } from "../services/products/seller.getProducts";
import { DeleteProductService } from "../services/products/seller.deleteProduct";
import { UpdateSingleProductStatusService } from "../services/products/seller.updateSingleProductStatus";
import { tr } from "zod/v4/locales";
import { getSellerProductByIdService } from "../services/products/seller.getProductById";
export async function getSellerProductsController(req: Request, res: Response) {
  await GetSellerProductsService(req, res);
}

export async function getSellerProductByIdController(
  req: Request,
  res: Response
) {
  try {
    const product = await getSellerProductByIdService(req, res);
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function CreateProductController(req: Request, res: Response) {
  const body = req.body;

  const files = req.files as Express.Multer.File[];
  console.log("Files received in controller:", files);

  // Parse variants metadata from JSON

  const variantsMetadata = JSON.parse(body.variantsMetadata || "[]");

  // Organize variant images by index
  const variantImagesMap: VariantImagesMap = {};
  files.forEach((file) => {
    // Match pattern: variantImages_0, variantImages_1, etc.
    const match = file.fieldname.match(/^variantImages_(\d+)$/);
    if (match) {
      const variantIndex = Number(match[1]);
      if (!variantImagesMap[variantIndex]) {
        variantImagesMap[variantIndex] = [];
      }
      variantImagesMap[variantIndex].push(file);
    }
  });

  const parsedBody = {
    productCategoryId: Number(body.productCategoryId),
    productSubCategoryId: body.productSubCategoryId,
    productDescription: body.productDescription,
    productName: body.productName,
    variantsMetadata: variantsMetadata,
    userId: Number(body.userId),
    variantImagesMap: variantImagesMap,
  } as CreateProductPayload;
  // 1. create product

  const createdProduct = await CreateSingleProductService(parsedBody, req, res);

  const createdVariants = await CreateProductVariantsService(
    parsedBody,
    createdProduct as Products,
    req,
    res
  );
  const createdImages = await CreateProductImagesService(
    parsedBody,
    createdVariants as ProductVariants[],
    createdProduct as Products,
    [],
    req,
    res
  );
  return;
}

export async function UpdateProductController(req: Request, res: Response) {
  const body = req.body;
  const files = req.files as Express.Multer.File[];
  console.log("Files recieved in update product controller", files);
  const variantMetadata = JSON.parse(body.variantsMetadata || "[]");
  const variantImagesMap: VariantImagesMap = {};
  const existingImages: ExistingImages[] = JSON.parse(
    body.existingImages || undefined
  );

  files.forEach((file) => {
    // Match pattern: variantImages_0, variantImages_1, etc.
    const match = file.fieldname.match(/^variantImages_(\d+)$/);
    if (match) {
      const variantIndex = Number(match[1]);
      if (!variantImagesMap[variantIndex]) {
        variantImagesMap[variantIndex] = [];
      }
      variantImagesMap[variantIndex].push(file);
    }
  });

  const parsedData = {
    productCategoryId: Number(body.productCategoryId),
    productSubCategoryId: Number(body.subCategoryId),
    productDescription: body.productDescription,
    userId: Number(body.userId),
    productId: Number(body.productId),
    productStatus: body.productStatus,
    variantsMetadata: variantMetadata,
    variantImagesMap: variantImagesMap,
    existingImages: existingImages,
  } as ProductUpdatePayload;

  const updatedProduct = await UpdateSingleProductService(parsedData, req, res);

  const updatedVariants = await UpdateProductVariantsService(
    parsedData,
    req,
    res
  );
  await CreateProductImagesService(
    parsedData,
    updatedVariants as ProductVariants[],
    updatedProduct as Products,
    existingImages,
    req,
    res,

    true
  );
  return;
}

export async function DeleteProductController(req: Request, res: Response) {
  const productId = req.params.id as string;

  await DeleteProductService(Number(productId), res);
}
export async function UpdateProductStatusController(
  req: Request,
  res: Response
) {
  const parsedData = {
    productId: Number(req.body.productId),
    status: req.body.status as string,
  } as ProductUpdateStatusPayload;

  await UpdateSingleProductStatusService(
    parsedData as ProductUpdateStatusPayload,
    req,
    res
  );
}
