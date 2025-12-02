import { Request, Response } from "express";
import {
  CreateProductService,
  DeleteProductService,
  GetSellerProductsService,
  UpdateProductService,
} from "../services/seller.products.service";
import {
  CreateProductPayload,
  ProductUpdatePayload,
  VariantImagesMap,
} from "../../types/products";
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

export async function CreateProductController(req: Request, res: Response) {
  try {
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

    const createdProduct = await CreateProductService(parsedBody, req, res);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: createdProduct,
    });
  } catch (error: any) {
    console.error("CreateProductController error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function UpdateProductController(req: Request, res: Response) {
  try {
    const body = req.body;
    const files = req.files as Express.Multer.File[];
    const variantMetadata = JSON.parse(body.variantsMetadata || "[]");
    const variantImagesMap: Record<number, Express.Multer.File[]> = {};

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
    } as ProductUpdatePayload;

    const updatedProducts = await UpdateProductService(parsedData, req, res);

    return res.status(201).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProducts,
    });
  } catch (error: any) {
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
