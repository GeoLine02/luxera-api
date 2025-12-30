interface VariantImagesMap {
  [index: number]: Express.Multer.File[];
}
interface CreateProductPayload {
  productCategoryId: number;
  productSubCategoryId: number;
  productDescription: string;
  variantsMetadata: VariantsMetadata[];
  userId: number;
  variantImagesMap: VariantImagesMap;
}

interface VariantsMetadata {
  id?: number;
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
  productId: number;
}

interface ProductUpdatePayload extends CreateProductPayload {
  productId: number;
  deletedVariantIds?: number[];
  deletedImageIds?: number[];
}

interface ProductUpdateStatusPayload {
  productId: number;
  status: string;
}
export {
  CreateProductPayload,
  VariantsMetadata,
  ProductUpdatePayload,
  VariantImagesMap,
  ProductUpdateStatusPayload,
};
