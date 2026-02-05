import Categories from "../sequelize/models/categories";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import SubCategories from "../sequelize/models/subcategories";
import { GoogleGenAI } from "@google/genai";
import sequelize from "../db";
import { QueryTypes, Transaction } from "sequelize";

export async function embedProductVariant(
  variantName: string,
  product: Products,
  category: Categories,
  subcategory: SubCategories,
) {
  const text = `${variantName} ${product.product_description} ${category.category_name} ${category.category_name_ka} ${subcategory.sub_category_name} ${subcategory.sub_category_name_ka}`;

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // Fixed structure
  const response = await ai.models.embedContent({
    model: "models/gemini-embedding-001", // ← note: usually prefixed with "models/"
    contents: [
      {
        role: "user",
        parts: [{ text: text }],
      },
    ],
    config: {
      outputDimensionality: 728,
    },
  });
  if (!response.embeddings) {
    throw new Error("Could not get embeddings");
  }
  const embedding = response.embeddings[0].values || [];
  if (embedding && embedding.length === 0) {
    throw new Error("Embedding Array is empty");
  }

  console.log("Embedding stored:", embedding.slice(0, 5), "..."); // preview first few values

  return embedding;
}
export function convertEmbeddingToVector(embedding: number[]): string {
  // PostgreSQL vector format: "[0.1, 0.2, 0.3, ...]"
  return `[${embedding.join(",")}]`;
}
