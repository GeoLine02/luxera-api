import z from "zod";

export const AIResponseSchema = z.object({
  message: z.string().optional().default(""),
  products: z
    .array(
      z.object({
        product_description: z.string(),
        variant_name: z.string(),
        product_id: z.number(),
        variant_id: z.number(),
        variant_price: z.number(),
        variant_quantity: z.number(),
        variant_discount: z.number(),
        image_id: z.number(),
        s3_key: z.string(),
        is_primary: z.boolean(),
        category_id: z.number(),
        category_name: z.string(),
        subcategory_id: z.number(),
        sub_category_name: z.string(),
      }),
    )
    .optional()
    .default([]),
});
export const AIResponseJsonSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product_description: { type: "string" },
          variant_name: { type: "string" },
          product_id: { type: "number" },
          variant_id: { type: "number" },
          variant_price: { type: "number" },
          variant_quantity: { type: "number" },
          variant_discount: { type: "number" },
          image_id: { type: "number" },
          s3_key: { type: "string" },
          is_primary: { type: "boolean" },
          category_id: { type: "number" },
          category_name: { type: "string" },
          subcategory_id: { type: "number" },
          sub_category_name: { type: "string" },
        },
        required: [
          "product_description",
          "variant_name",
          "product_id",
          "variant_id",
          "variant_price",
          "variant_quantity",
          "variant_discount",
          "image_id",
          "s3_key",
          "is_primary",
          "category_id",
          "category_name",
          "subcategory_id",
          "sub_category_name",
        ],
      },
    },
  },
  required: ["message", "products"],
};
export const classificationJsonSchema = {
  type: "object",
  properties: {
    needsSearch: {
      type: "boolean",
    },
    chitChatResponse: {
      type: ["string", "null"],
    },
    minPrice: {
      type: ["number", "null"],
    },
    maxPrice: {
      type: ["number", "null"],
    },
    category: {
      type: ["string", "null"],
    },
    subcategory: {
      type: ["string", "null"],
    },
  },
  required: [
    "needsSearch",
    "chitChatResponse",
    "minPrice",
    "maxPrice",
    "category",
    "subcategory",
  ],
};
