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
  index: number;
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
  productId: number;
}

interface ProductUpdatePayload extends CreateProductPayload {
  productStatus: string;
  productId: number;
}

export {
  CreateProductPayload,
  VariantsMetadata,
  ProductUpdatePayload,
  VariantImagesMap,
};
