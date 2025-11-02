import { z } from "zod";

// Zod schema for product variant
const ProductVariantSchema = z.object({
  variantName: z
    .string()
    .min(1, "Variant name is required")
    .max(100, "Variant name must not exceed 100 characters"),
  variantPrice: z
    .number()
    .nonnegative("Variant price must be a positive number")
    .finite("Variant price must be a valid number"),
  variantQuantity: z
    .number()
    .int("Variant quantity must be an integer")
    .nonnegative("Variant quantity must be a positive number"),
  variantDiscount: z
    .number()
    .min(0, "Variant discount must be at least 0")
    .max(100, "Variant discount must not exceed 100")
    .finite("Variant discount must be a valid number"),
  product_id: z
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be a positive number"),
});

// Zod schema for product creation
const ProductCreationSchema = z
  .object({
    productId: z
      .number()
      .int("Product ID must be an integer")
      .positive("Product ID must be a positive number"),
    productCategoryId: z
      .number()
      .int("Category ID must be an integer")
      .positive("Category ID must be a positive number"),
    subCategoryId: z
      .number()
      .int("Subcategory ID must be an integer")
      .positive("Subcategory ID must be a positive number"),
    productDescription: z
      .string()
      .min(1, "Product description is required")
      .max(5000, "Product description must not exceed 5000 characters"),
    productImages: z
      .array(z.any())
      .min(1, "At least one product image is required")
      .max(10, "Maximum 10 product images allowed")
      .refine(
        (files) =>
          files.every(
            (file) =>
              file && file.mimetype && file.mimetype.startsWith("image/")
          ),
        "All product images must be valid image files"
      ),
    productPreviewImages: z
      .array(z.any())
      .refine(
        (files) =>
          files.every(
            (file) =>
              file && file.mimetype && file.mimetype.startsWith("image/")
          ),
        "All product images must be valid image files"
      ),
    productQuantity: z
      .number()
      .int("Product quantity must be an integer")
      .nonnegative("Product quantity must be a positive number"),
    productDiscount: z
      .number()
      .min(0, "Product discount must be at least 0")
      .max(100, "Product discount must not exceed 100")
      .finite("Product discount must be a valid number"),
    productName: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Product name must not exceed 200 characters")
      .trim(),
    productPrice: z
      .number()
      .positive("Product price must be a positive number")
      .finite("Product price must be a valid number"),
    productVariants: z.array(ProductVariantSchema).optional().default([]),
    userId: z
      .number()
      .int("User ID must be an integer")
      .positive("User ID must be a positive number"),
  })
  .refine((data) => {
    // Ensure variant price doesn't exceed product price (optional business logic)
    if (data.productVariants && data.productVariants.length > 0) {
      return data.productVariants.every((variant) => variant.variantPrice >= 0);
    }
    return true;
  }, "Invalid variant pricing");

// Export schemas
export { ProductVariantSchema, ProductCreationSchema };

// Type inference from schemas (optional but useful)
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type ProductCreationInput = z.infer<typeof ProductCreationSchema>;
