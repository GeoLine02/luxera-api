import { Cities, Shop, User } from "../sequelize/models/associate";
import ProductImages from "../sequelize/models/productimages";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";

interface VariantImageInput {
  file?: Express.Multer.File;
  imageId?: number;
  isPrimary?: boolean;
  s3_key?: string;
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

interface HomePageProduct extends Products {
  primaryVariant:
    | (ProductVariants & { image: { id: number; s3_key: string } })
    | null;
}
interface ProductVariantWithImages extends ProductVariants {
  images: Omit<ProductImages[], "product_id" | "variant_id">;
}
interface ProductDetails extends Products {
  variants: ProductVariantWithImages[];
  owner: Omit<User, "password" | "createdAt" | "updatedAt">;
  shop: ShopWithCity;
}
interface ShopWithCity extends Shop {
  city: Cities;
}
export {
  CreateProductPayload,
  VariantsMetadata,
  ProductUpdatePayload,
  VariantImagesMap,
  ProductUpdateStatusPayload,
  VariantImageInput,
  HomePageProduct,
  ProductVariantWithImages,
  ProductDetails,
};
