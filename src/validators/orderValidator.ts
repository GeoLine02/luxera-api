import z from "zod";

// Basket Item Validation
const BasketItemSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  productQuantity: z
    .number()
    .int()
    .positive("Product quantity must be at least 1"),
  price: z.number().positive("Price must be greater than 0"),
  shopId: z.number().int().positive("Shop ID must be a positive integer"),
  variantId: z.number().int().positive("Variant ID must be a positive integer"),
});

// Order Payload Validation
const CreateOrderSchema = z.object({
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),
  streetAddress: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(100, "Street address must not exceed 100 characters"),
  postcode: z
    .string()
    .min(2, "Postcode must be at least 2 characters")
    .max(20, "Postcode must not exceed 20 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must not exceed 50 characters"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must not exceed 50 characters")
    .optional(),
  phoneNumber: z
    .string()
    .regex(
      /^[+]?[0-9]{7,15}$/,
      "Phone number must be valid (7-15 digits, optional + prefix)",
    ),
  email: z.string().email("Invalid email address"),
  payment_method: z
    .string()
    .min(1, "Payment method is required")
    .max(50, "Payment method must not exceed 50 characters"),
  basket: z
    .array(BasketItemSchema)
    .min(1, "Basket must contain at least one item"),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD, GEL)")
    .toUpperCase(),
});

// Type inference from schemas
type OrderPayload = z.infer<typeof CreateOrderSchema>;
type BasketItem = z.infer<typeof BasketItemSchema>;

export { CreateOrderSchema, BasketItemSchema, OrderPayload, BasketItem };
