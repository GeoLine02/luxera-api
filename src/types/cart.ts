import { VariantsMetadata } from "./products"

interface AddCartItemPayload {
    productId:number,
    userId:number
    variantId?: number
}
interface DeleteCartItemPayload extends AddCartItemPayload{
    removeCompletely?: boolean
}
interface CartItemDBPayload {
    id:number,
    product_quantity:number
    variant: {
    id:number,
    variantName:string,
    variantPrice:number,
    images: {
        id:number,
        image:string
    }[]

    } | null,
    product:{
        id:number,
        product_name:string,
        product_price:number,
        product_image:string
    }
}
export type  { AddCartItemPayload, CartItemDBPayload,DeleteCartItemPayload};
