import { GoogleGenAI, Schema } from "@google/genai";
import { BadRequestError } from "../errors/errors";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import sequelize from "../db";
import { QueryTypes } from "sequelize";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export async function extractFilters(userPrompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",

    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],

    config: {
      maxOutputTokens: 100,
      temperature: 1,
      systemInstruction:
        "You are Shopping assistant. Your name is Luxera AI. You recommend users our products. extract intent as JSON with: category, maxPrice, minPrice",
    },
  });
  if (!response) {
    throw new BadRequestError("Failed to get model response");
  }
  const data = response.text;
  return data;
}

export async function embedContent(text: string) {
  const response = await ai.models.embedContent({
    model: "models/gemini-embedding-001",
    contents: [{ role: "user", parts: [{ text: text }] }],
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
  return embedding;
}
export async function searchByVector(embedding: number[]) {
  const vectorString = `[${embedding.join(",")}]`;
  const products = await sequelize.query(
    `SELECT 
      p.id,
      p.product_description,
      pv.variant_name,
      pv.product_id,
      pv.variant_price,
      pv.variant_quantity,
      pv.variant_discount
    FROM "Products" p
    LEFT JOIN "ProductVariants" pv ON p.id = pv.product_id
    WHERE pv.embedding IS NOT NULL
    ORDER BY pv.embedding <-> $1::vector ASC
    LIMIT 5`,
    {
      type: QueryTypes.SELECT,
      bind: [vectorString],
    },
  );

  return products;
}
