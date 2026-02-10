import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const response = await ai.models.embedContent({
    config: {
      outputDimensionality: 728,
    },
    model: "gemini-embedding-001",
    contents: "რა არის ცხოვრების აზრი?",
  });
  
  console.log(response.embeddings);
}

main();
