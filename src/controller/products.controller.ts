import { Request, Response } from "express";
import {
  AllProductsService,
  CreateProductService,
  DeleteProductService,
  FeaturedProductsService,
  // UpdateProductService,
  VipProductsService,
} from "../services/product.service";

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

export async function CreateProductController(req: Request, res: Response) {
  try {
    const body = req.body;
    const files = req.files as Express.Multer.File[];

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

    // Build clean data object
    const data = {
      productName: body.productName,
      productDescription: body.productDescription,
      productCategoryId: Number(body.productCategoryId),
      subCategoryId: Number(body.subCategoryId),
      productPrice: Number(body.productPrice),
      productQuantity: Number(body.productQuantity),
      productDiscount: Number(body.productDiscount),
      userId: Number(body.userId),
      productPreviewImages,
      variantsMetadata: variantsMetadata,
    };

    const createdProduct = await CreateProductService(
      data,
      req,
      variantImagesMap
    );

    return res.status(201).json({
      success: true,
      product: createdProduct,
    });
  } catch (error: any) {
    console.error("CreateProductController error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// export async function UpdateProductController(req: Request, res: Response) {
//   try {
//     const body = req.body;
//     const files = req.files;

//     const data = {
//       ...body,
//       productImages: files,
//     };

//     const updatedProducts = await UpdateProductService(data, req);

//     return res.status(201).json(updatedProducts);
//   } catch (error: any) {
//     return res.status(500).json({
//       error: error.message,
//     });
//   }
// }

export async function DeleteProductController(req: Request, res: Response) {
  try {
    const productId = req.query.productId as string;

    const deletedProduct = await DeleteProductService(productId);

    return res.status(204).json(deletedProduct);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
