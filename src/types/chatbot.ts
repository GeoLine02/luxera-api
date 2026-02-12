interface AIResponse {
  message: string;
  products: {
    product_description: string;
    variant_name: string;
    product_id: number;
    variant_id: number;
    variant_price: number;
    variant_quantity: number;
    variant_discount: number;
    image_id: number;
    s3_key: string;
    is_primary: boolean;
    category_id: number;
    category_name: string;
    subcategory_id: number;
    sub_category_name: string;
  }[];
}
export interface Filters {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  subcategory?: string;
  viewedProductIds?: number[];
  brands?: string[];
  sortBy?: string;
  intentSummary?: string;
}
export interface ProductResults {
  id: number;
  product_description: string;
  variant_name: string;
  product_id: number;
  variant_id: number;
  variant_price: number;
  variant_quantity: number;
  variant_discount: number;
  distance: number;
  image_id: number;
  s3_key: string;
  is_primary: boolean;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  sub_category_name: string;
}
export interface SearchState extends Filters {
  lastQuery?: string;
  category: string;
  subcategory: string;
  maxPrice: number;
  minPrice: number;
  viewedProductIds: number[];
  timestamp?: string;
}
