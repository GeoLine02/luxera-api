interface AddCartItemPayload {
  productId: number;
  userId: number;
  variantId: number;
  quantity: number;
}
interface DeleteCartItemPayload extends AddCartItemPayload {
  removeCompletely?: boolean;
}

interface CartItemDBPayload {
  id: number;
  product_quantity: number;
  variant: {
    id: number;
    variantName: string;
    variantPrice: number;
    images: {
      id: number;
      image: string;
    }[];
  } | null;
  product: {
    id: number;
    product_description: string;
    product_rating: number;
    product_owner_id: number;
    product_subcategory_id: number;
    product_status: string;
    shop_id: number;
    primary_variant_id: number;
  };
}
export type { AddCartItemPayload, CartItemDBPayload, DeleteCartItemPayload };
