import { Request, Response } from "express";
import { ValidationError } from "../errors/errors";
import { GoogleGenAI } from "@google/genai";
import {
  embedContent,
  extractFilters,
  searchByVector,
} from "./chatbot.service";
import { success } from "zod";
import { successfulResponse } from "../utils/responseHandler";
export async function AskAssistantController(req: Request, res: Response) {
  // const { userId, conversationId } = req.body;
  const userPrompt = req.body.userPrompt as string;
  if (!userPrompt || userPrompt.length === 0) {
    throw new ValidationError([
      {
        field: "userPrompt",
        message: "userPrompt is required",
      },
    ]);
  }

  // const filters = await extractFilters(userPrompt);
  const embededPrompt = await embedContent(userPrompt);
  const products = await searchByVector(embededPrompt);

  return successfulResponse(res, "Got AI response", products);
}
export async function GetChatHistoryController(req: Request, res: Response) {}
