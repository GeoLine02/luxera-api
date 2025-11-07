interface ProductPayload {
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

}
interface VariantsMetadata {
  index: number;
  variantName: string;
  variantPrice: number;
  variantQuantity: number;
  variantDiscount: number;
  product_id: number;
}

interface ProductUpdatePayload extends ProductPayload {
    productStatus: number;
    productId:number;
}

export { ProductPayload, VariantsMetadata ,ProductUpdatePayload};