interface CreateProductPayload {
  productCategoryId: number;
  subCategoryId: number;
  productDescription: string;
  productPreviewImages: Express.Multer.File[];
  productQuantity: number;
  productDiscount: number;
  productName: string ;
  productPrice: number;
  variantsMetadata: VariantsMetadata[];
  userId: number;
  variantImagesMap?: Record<string, Express.Multer.File[]>;
  
}

interface VariantsMetadata {
  index: number;
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
  product_id: number;
}

interface ProductUpdatePayload extends CreateProductPayload {
    productStatus: string;
    productId:number;
}


export { CreateProductPayload, VariantsMetadata ,ProductUpdatePayload};