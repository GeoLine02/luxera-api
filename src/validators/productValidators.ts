import { z } from "zod";
const PRODUCT_STATUSES = [
  "vip",
  "active",
  "inactive",
  "pending",
  "rejected",
  "out of stock",
];
// ✅ Reusable variant schema with proper validation
const ProductVariantSchema = z
  .object({
    // Variant Name
    variantName: z
      .string({ error: "Variant name must be a string" })
      .min(1, "Variant name cannot be empty")
      .max(100, "Variant name must not exceed 100 characters")
      .trim()
      .refine(
        (val) => val.length > 0,
        "Variant name cannot be only whitespace"
      ),

    // Variant Price
    variantPrice: z
      .number({ error: "Variant price must be a number" })
      .positive("Variant price must be greater than 0")
      .finite("Variant price must be a valid number")
      .max(1000000, "Variant price cannot exceed 1,000,000")
      .multipleOf(0.01, "Variant price can have at most 2 decimal places"),

    // Variant Quantity
    variantQuantity: z
      .number({ error: "Variant quantity must be a number" })
      .int("Variant quantity must be an integer")
      .nonnegative("Variant quantity cannot be negative")
      .max(100000, "Variant quantity cannot exceed 100,000"),

    // Variant Discount
    variantDiscount: z
      .number({ error: "Variant discount must be a number" })
      .min(0, "Variant discount cannot be negative")
      .max(100, "Variant discount cannot exceed 100%")
      .finite("Variant discount must be a valid number")
      .multipleOf(0.01, "Variant discount can have at most 2 decimal places"),

    // Optional: ID for updates
    id: z.number().int().positive().optional(),
    tempId: z.string().optional(),
    imageFields: z.array(z.string()).optional(),
    primaryImageField: z.string().optional(),
  })

  // Cross-field validation
  .refine(
    (data) => {
      if (data.variantDiscount > 0) {
        const priceAfterDiscount =
          data.variantPrice * (1 - data.variantDiscount / 100);
        return priceAfterDiscount > 0;
      }
      return true;
    },
    {
      error: "Discount is too high - final price must be greater than 0",
      path: ["variantDiscount"],
    }
  )
  .refine(
    (data) => {
      const discountAmount = (data.variantPrice * data.variantDiscount) / 100;
      return discountAmount < data.variantPrice;
    },
    {
      error: "Discount cannot make the product free or negative",
      path: ["variantDiscount"],
    }
  );

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
  productCategoryId: z
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
const ProductUpdateSchema = z.object({
  productId: z
    .string()
    .transform(Number)
    .pipe(
      z
        .number()
        .int("Product ID must be an integer")
        .positive("Product ID must be a positive number")
    ),

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
const ProductUpdateStatusSchema = z.object({
  productId: z
    .int("Product ID must be an integer")
    .positive("Product ID must be a positive number"),
  status: z.enum(PRODUCT_STATUSES),
});

// Export schemas
export {
  ProductVariantSchema,
  ProductCreationSchema,
  ProductUpdateSchema,
  ProductUpdateStatusSchema,
};

// Type inference from schemas
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type ProductCreationInput = z.infer<typeof ProductCreationSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
