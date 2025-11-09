
import { Request, Response } from "express";
import { CreateProductService, DeleteProductService, GetSellerProductsService, UpdateProductService } from "../services/seller.products.service";
import { ProductUpdatePayload } from "../../types/products";
export async function getSellerProductsController(req: Request, res: Response) {
    try{
   const sellertProducts = await GetSellerProductsService(req);
    res.status(200).json({message:"Successfully fetched seller products",data:sellertProducts})
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"GetSelerProductsController error"})
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


  
    const createdProduct = await CreateProductService(
      {
...body,
        productPreviewImages,
        variantsMetadata,
      },
 
      
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
   
    const data = {
      ...body,
      productPreviewImages: files,
      variantsMetadata: variantMetadata,
      
    } as ProductUpdatePayload;
    
  

    const updatedProducts = await UpdateProductService(data, req,variantImagesMap);

    return res.status(201).json(updatedProducts);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

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