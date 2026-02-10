import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ConversationMessage } from "../../sequelize/models/conversationMessage";
import { GoogleGenAI } from "@google/genai";
import SubCategories from "../../sequelize/models/subcategories";
import Categories from "../../sequelize/models/categories";
import { BadRequestError } from "../../errors/errors";
import sequelize from "../../db";

import { QueryTypes } from "sequelize";

const classificationResponseSchema = z.object({
  needsSearch: z.boolean(),
  chitChatResponse: z.string().nullable(),
  minPrice: z.number().nullable,
  maxPrice: z.number().nullable(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
});
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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
function toPgVectorString(embedding: number[]): string {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Invalid embedding: empty or not an array");
  }
  return `[${embedding.map((v) => v.toFixed(6)).join(",")}]`;
}
export async function searchByVector(
  embedding: number[],
  filters: Filters,
): Promise<ProductResults[]> {
  const vectorStr = toPgVectorString(embedding);
  console.log("filters");
  // Build dynamic WHERE conditions
  const whereClauses: string[] = ["pv.embedding IS NOT NULL"];
  const bindValues: any[] = [vectorStr];
  // Price filter (always present, but with defaults)
  whereClauses.push("pv.variant_price BETWEEN $2 AND $3");
  bindValues.push(filters.minPrice ?? 0);
  bindValues.push(filters.maxPrice ?? 999999);

  // Category filter (only if provided)
  if (filters.category) {
    whereClauses.push("cat.category_name = $4");
    bindValues.push(filters.category);
    console.log("Applying category filter:", filters.category);
  }

  // Subcategory filter (only if provided)
  if (filters.subcategory) {
    whereClauses.push("subcat.sub_category_name = $5");
    bindValues.push(filters.subcategory);
    console.log("Applying subcategory filter:", filters.subcategory);
  }
  const whereSql =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const sql = `
    SELECT 
      p.id                  AS product_id,
      p.product_description,
      pv.id                 AS variant_id,
      pv.variant_name,
      pv.variant_price,
      pv.variant_quantity,
      pv.variant_discount,
      pi.id                 AS image_id,
      pi.s3_key,
      cat.id                AS category_id,
      cat.category_name,
      subcat.id             AS subcategory_id,
      subcat.sub_category_name,
      pv.embedding <-> $1::vector AS distance
    FROM "Products" p
    INNER JOIN "ProductVariants" pv 
      ON p.id = pv.product_id
    LEFT JOIN "ProductImages" pi 
      ON pv.id = pi.variant_id AND pi.is_primary = true
    LEFT JOIN "SubCategories" subcat
      ON p.product_subcategory_id = subcat.id
    LEFT JOIN "Categories" cat 
      ON subcat.category_id = cat.id
    ${whereSql}
    ORDER BY pv.embedding <-> $1::vector ASC
    LIMIT 5
  `;

  const results = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    bind: bindValues,
  });

  return results as ProductResults[];
}
interface Filters {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  subcategory?: string;
}
export interface ProductResults {
  id: number;
  product_description: string;
  variant_name: string;
  product_id: number;
  variant_id: number;
  variant_price: number;
  variant_quantity: number;
  variant_discount: number;
  distance: number;
  image_id: number;
  s3_key: string;
  is_primary: boolean;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  sub_category_name: string;
}
export async function formatProductResults(
  products: ProductResults[],
  filters: Filters,
  conversationHistory: ConversationMessage[],
  userPrompt: string,
): Promise<string> {
  // ← returns formatted text for frontend / chat
  // Optional: pre-filter cheaply in code

  const history = conversationHistory.map((conv) => {
    return {
      role: conv.role === "user" ? "user" : "model",
      parts: [
        {
          text: conv.content,
        },
      ],
    };
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      ...history,
      {
        role: "user",
        parts: [
          {
            text: `
            You are a helpful friendly shopping assistant.
             Ask follow-up questions if the user prompt is vague or missing important details. Here are the matching products:    
Here are the matching products:
        ${
          JSON.stringify(
            products.map((product) => {
              return {
                productName: product.variant_name,
                price: product.variant_price,
                discount: product.variant_discount,
                description: product.product_description,
                category: product.category_name,
                subcategory: product.sub_category_name,
              };
            }),
          ) || ""
        }
          filters applied: ${JSON.stringify(filters) || "none"}
        If no products match, politely say you couldn't find anything and suggest broadening the search.
         
         User prompt: ${userPrompt}   
            `,
          },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 600,
      systemInstruction: ` Respond naturally about products. Keep responses to 2-3 sentences. Highlight best deals, mention discounts, and suggest 1–3
         top picks if there are many. Use nice formatting with emojis if appropriate.
         You are a helpful shopping assistant.
       `,
    },
  });
  const text = response.text;

  return text || "ბოდიშით, ამ დროისათვის ინფორმაციის დამუშავება ვერ მოხერხდა";
}
// utils/retryWithBackoff.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  } = {},
): Promise<T> {
  const { maxRetries = 5, baseDelayMs = 1000, maxDelayMs = 30000 } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isRateLimit =
        err?.status === 429 ||
        err?.code === "429" ||
        String(err).includes("rate limit");
      if (!isRateLimit || attempt >= maxRetries) {
        throw err;
      }

      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt - 1),
        maxDelayMs,
      );
      console.warn(
        `Rate limit hit (attempt ${attempt}/${maxRetries}), waiting ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
export async function classifyAndExtract(
  prompt: string,
  history: ConversationMessage[] = [],
): Promise<{
  needsSearch: boolean;
  reason: string;
  refinedQuery?: string;
  chitChatResponse?: string;
  filters?: Filters;
}> {
  const recentHistory = history.slice(-6).map((m) => {
    return {
      role: m.role === "user" ? "user" : "model",
      parts: [
        {
          text: m.content,
        },
      ],
    };
  });

  const categories = await Categories.findAll({
    attributes: ["id", "category_name", "category_name_ka"],
    raw: true,
  });

  const subcategories = await SubCategories.findAll({
    attributes: [
      "id",
      "category_id",
      "sub_category_name",
      "sub_category_name_ka",
    ],
    raw: true,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      ...recentHistory,
      {
        role: "user",
        parts: [
          {
            text: `
Decide if the user's message requires searching for products in the store database.
Extract filters if the user is asking about products, prices, styles, categories, recommendations, or comparisons.
Rules:
- Needs search if asking about products, prices, styles, categories, recommendations, comparisons
- Does NOT need search for: greetings, thanks, chit-chat, questions about the bot, off-topic, clarification requests without new product intent
Respond ONLY in JSON:
{
  "needsSearch": boolean,
  "chitChatResponse": "If needsSearch=false, provide a friendly chit-chat response to the user. If needsSearch=true, set chitChatResponse to null."
}
    Available Categories (from database): 
          ${JSON.stringify(categories)}
          Available Subcategories (from database):
          ${JSON.stringify(subcategories)}
          
          Subcategories Belongs to Categories (category_id is foreign key)
      
            User Prompt: ${prompt}
            `,
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 150,
      responseMimeType: "application/json",
      systemInstruction: `
You are a helpful assistant that classifies user messages and extracts product search filters for an online store. Always respond in the specified JSON format without any additional text or explanation. If the user's message does not require a search, set needsSearch to false and provide a friendly chit-chat response in chitChatResponse. If a search is needed, extract precise filters based on the user's intent and the available categories/subcategories. Use the provided database categories and subcategories to ensure accurate filter extraction.
      `,
      responseJsonSchema: zodToJsonSchema(classificationResponseSchema as any),
    },
  });

  try {
    const json = JSON.parse(response.text || "{}");
    console.log("Classifier response:", json);

    return {
      needsSearch: json.needsSearch ?? false,
      reason: json.reason || "classified by model",
      filters: {
        minPrice: json.minPrice ?? undefined,
        maxPrice: json.maxPrice ?? undefined,
        category: json.category ?? undefined,
        subcategory: json.subcategory ?? undefined,
      },

      chitChatResponse: json.chitChatResponse,
    };
  } catch {
    // fallback if model outputs garbage
    return {
      needsSearch: true,
      reason: "classification failed → assume search",
      filters: undefined,
    };
  }
}
