import { z } from "zod";
const PRODUCT_STATUSES = ["basic", "vip", "active"];
// ✅ Reusable variant schema with proper validation
const ProductVariantSchema = z.object({
  variantName: z
    .string()
    .min(1, "Variant name is required")
    .max(100, "Variant name must not exceed 100 characters")
    .trim(),
  variantPrice: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .nonnegative("Variant price must be a positive number")
        .finite("Variant price must be a valid number")
    ),
  variantQuantity: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("Variant quantity must be an integer")
        .nonnegative("Variant quantity must be a positive number")
    ),
  variantDiscount: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .min(0, "Variant discount must be at least 0")
        .max(100, "Variant discount must not exceed 100")
        .finite("Variant discount must be a valid number")
    ),
});

// ✅ Product creation schema - accepts strings, transforms to numbers
const ProductCreationSchema = z.object({
  productDescription: z
    .string()
    .min(1, "Product description is required")
    .max(5000, "Product description must not exceed 5000 characters")
    .trim(),
  productSubCategoryId: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("Subcategory ID must be an integer")
        .positive("Subcategory ID must be a positive number")
    ),
});

// ✅ Product update schema - accepts strings, transforms to numbers
const UpdateProductSchema = z.object({
  productId: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("Product ID must be an integer")
        .positive("Product ID must be a positive number")
    ),

  productStatus: z.enum(PRODUCT_STATUSES, {
    message: "Product status must be one of: " + PRODUCT_STATUSES.join(", "),
  }),
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),
  productDescription: z
    .string()
    .min(1, "Product description is required")
    .max(5000, "Product description must not exceed 5000 characters")
    .trim(),
  productCategoryId: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("Category ID must be an integer")
        .positive("Category ID must be a positive number")
    ),
  subCategoryId: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("Subcategory ID must be an integer")
        .positive("Subcategory ID must be a positive number")
    ),

  userId: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("User ID must be an integer")
        .positive("User ID must be a positive number")
    ),
});

// Export schemas
export { ProductVariantSchema, ProductCreationSchema, UpdateProductSchema };

// Type inference from schemas
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type ProductCreationInput = z.infer<typeof ProductCreationSchema>;
export type ProductUpdateInput = z.infer<typeof UpdateProductSchema>;
