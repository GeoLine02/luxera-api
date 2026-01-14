interface VariantImageInput {
  file?: Express.Multer.File;
  imageId?: number;
  isPrimary?: boolean;
}
type VariantImagesMap = {
  [key: string | number]: VariantImageInput[];
};
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
  tempId?: string;
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
  productId: number;
  imageFields?: string[];
  primaryImageField?: string;
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
