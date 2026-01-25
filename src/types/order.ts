interface OrderPayload {
  city: string;
  streetAddress: string;
  postcode: string;
  state: string;
  country?: string;
  phoneNumber: string;
  email: string;
  payment_method: string;
  basket: BasketItem[];
  currency: string;
}
interface BasketItem {
  productId: number;
  productQuantity: number;
  price: number;
  shopId: number;
  variantId: number;
}
export { OrderPayload, BasketItem };
