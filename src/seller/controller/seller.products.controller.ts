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
    const user = req.user;
    console.log("bodddyyy", body);
    const files = req.files as Express.Multer.File[];
    console.log("Files received in controller:", files);
    // Extract product preview images
    const productPreviewImages = files.filter(
      (file) => file.fieldname === "productPreviewImages"
    );

    // Parse variants metadata from JSON
    const variantsMetadata = JSON.parse(body.variantsMetadata || "[]");

    // Organize variant images by index
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
    const parsedBody = {
      productCategoryId: Number(body.productCategoryId),
      subCategoryId: Number(body.subCategoryId),
      productDescription: body.productDescription,
      productQuantity: Number(body.productQuantity),
      productDiscount: Number(body.productDiscount),
      productName: body.productName,
      productPrice: Number(body.productPrice),
      variantsMetadata: variantsMetadata,
      productPreviewImages: productPreviewImages,
      variantImagesMap: variantImagesMap,
      userId: user?.id,
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
      subCategoryId: Number(body.subCategoryId),
      productDescription: body.productDescription,
      productQuantity: Number(body.productQuantity),
      productDiscount: Number(body.productDiscount),
      productName: body.productName,
      productPrice: Number(body.productPrice),
      userId: Number(body.userId),
      productId: Number(body.productId),
      productStatus: body.productStatus,
      productPreviewImages: files,
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
    const productId = req.query.q as string;

    const deletedProduct = await DeleteProductService(productId, res);
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
