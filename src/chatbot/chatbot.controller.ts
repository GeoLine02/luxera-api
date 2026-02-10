import { Request, Response } from "express";
import { NotFoundError, ValidationError } from "../errors/errors";
import { GoogleGenAI } from "@google/genai";

import { success } from "zod";
import {
  paginatedResponse,
  successfulResponse,
} from "../utils/responseHandler";
import { Conversation } from "../sequelize/models/conversation";
import { ConversationMessage } from "../sequelize/models/conversationMessage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../app";
import { GetObjectCommand, NotFound } from "@aws-sdk/client-s3";
import { getConversationById } from "./services/chatbot.conversation";
import {
  classifyAndExtract,
  embedContent,
  formatProductResults,
  ProductResults,
  retryWithBackoff,
  searchByVector,
} from "./services/chatbot.agent";
import sequelize from "../db";
import { ConversationMessageImage } from "../sequelize/models/conversationMessageImages";
import { ConversationMessageProductCard } from "../sequelize/models/conversationMessageProductCards";
import { GetSignedUrlFromS3 } from "../utils/getSignedUrl";

export async function StartConversationController(req: Request, res: Response) {
  const userId = req.user!.id;
  const userPrompt = req.body.userPrompt as string;
  // Create new conversation
  const transaction = await sequelize.transaction();

  const conversation = await Conversation.create(
    {
      user_id: userId,
      title: userPrompt.substring(0, 50),
    },
    { transaction },
  );
  try {
    const conversationMessage = await ConversationMessage.create(
      {
        conversation_id: conversation.id,
        role: "user",
        content: userPrompt,
      },
      { transaction },
    );
    console.log("created user message", conversationMessage);

    const { needsSearch, refinedQuery, chitChatResponse, filters } =
      await retryWithBackoff(() => classifyAndExtract(userPrompt, []));

    if (!needsSearch && chitChatResponse) {
      await transaction.commit();
      return successfulResponse(res, "Got Luxera AI response", {
        conversation_id: conversation.id,
        message: chitChatResponse,
        products: [],
      });
    }

    const embededPrompt = await retryWithBackoff(() =>
      embedContent(refinedQuery || userPrompt),
    );

    const products = (await searchByVector(
      embededPrompt,
      filters || {},
    )) as ProductResults[];

    const assistantMessageContent = await retryWithBackoff(() =>
      formatProductResults(
        products,
        filters || {},
        [],
        refinedQuery || userPrompt,
      ),
    );

    const assistantMessageRecord = await ConversationMessage.create(
      {
        conversation_id: conversation.id,
        role: "assistant",
        content: assistantMessageContent,
        metadata: {
          filters: filters,
          productIds: products.map((p) => p.id),
          timestamp: new Date(),
        },
      },
      { transaction },
    );
    if (!assistantMessageRecord) {
      throw new Error("Failed to create assistant message");
    }
    console.log("created assistant message", assistantMessageRecord);
    // Auto-generate title on first message
    if (!conversation.title) {
      conversation.title = userPrompt.substring(0, 50); // Or use Claude
      await conversation.save({ transaction });
    }

    const processedProducts = await Promise.all(
      products.map(async (product: ProductResults) => {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: product.s3_key,
        };

        const signedUrl = await getSignedUrl(s3, new GetObjectCommand(params), {
          expiresIn: 3600,
        });
        const link =
          `${process.env.PROD_FRONTEND_URL}/product/${product.variant_name}-${product.variant_id}`.replace(
            / /g,
            "%20",
          );

        const card = await ConversationMessageProductCard.create(
          {
            conversation_message_id: assistantMessageRecord.id,
            variant_id: product.variant_id,
            product_id: product.product_id,

            link: link,
          },
          { transaction },
        );
        await ConversationMessageImage.create(
          {
            conversation_message_id: assistantMessageRecord.id,
            image_id: product.image_id,
            card_id: card.id,
          },
          { transaction },
        );

        return {
          ...product,
          imageUrl: signedUrl,
          link: link,
        };
      }),
    );
    await transaction.commit();
    return successfulResponse(res, "Got Luxera AI response", {
      conversation_id: conversation.id,
      message: assistantMessageContent,
      products: processedProducts,
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      // Ignore if transaction is already committed or rolled back
    }
    throw error;
  }
}

export async function AskAssistantController(req: Request, res: Response) {
  const userId = req.user!.id;
  const userPrompt = req.body.userPrompt as string;
  const conversationId = req.params.conversationId;
  const transaction = await sequelize.transaction();

  const conversation = await Conversation.findOne({
    where: { id: conversationId, user_id: userId },
  });

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }
  try {
    await ConversationMessage.create(
      {
        conversation_id: conversation.id,
        role: "user",
        content: userPrompt,
      },
      { transaction },
    );
    const conversationHistory = await ConversationMessage.findAll({
      where: { conversation_id: conversation.id },
      order: [["createdAt", "ASC"]],
      limit: 10, // Last 10 messages
    });
    console.log(
      "conversation history",
      conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    );

    const { needsSearch, chitChatResponse, filters } = await classifyAndExtract(
      userPrompt,
      conversationHistory,
    );
    if (!needsSearch && chitChatResponse) {
      await transaction.commit();
      return successfulResponse(res, "Got Luxera AI response", {
        conversation_id: conversation.id,
        message: chitChatResponse,
        products: [],
      });
    }

    const embededPrompt = await retryWithBackoff(() =>
      embedContent(userPrompt),
    );
    const products = (await searchByVector(
      embededPrompt,
      filters || {},
    )) as ProductResults[];
    const assistantMessageContent = await retryWithBackoff(() =>
      formatProductResults(
        products,
        filters || {},
        conversationHistory,
        userPrompt,
      ),
    );

    const assistantMessageRecord = await ConversationMessage.create(
      {
        conversation_id: conversation.id,
        role: "assistant",
        content: assistantMessageContent,
        metadata: {
          filters: filters,
          productIds: products.map((p) => p.id),
          timestamp: new Date(),
        },
      },
      { transaction },
    );

    // Auto-generate title on first message
    if (!conversation.title) {
      conversation.title = userPrompt.substring(0, 50); // Or use Claude
      await conversation.save({ transaction });
    }
    const processedProducts = await Promise.all(
      products.map(async (product: any) => {
        try {
          const signedUrl = await GetSignedUrlFromS3(product.s3_key);
          const link =
            `${process.env.PROD_FRONTEND_URL}/product/${product.variant_name}-${product.variant_id}`.replace(
              / /g,
              "%20",
            );

          const card = await ConversationMessageProductCard.create(
            {
              conversation_message_id: assistantMessageRecord.id,
              product_id: product.product_id,
              variant_id: product.variant_id,
              link: link,
            },
            { transaction },
          );

          await ConversationMessageImage.create(
            {
              conversation_message_id: assistantMessageRecord.id,
              image_id: product.image_id,
              card_id: card.id,
            },
            { transaction },
          );
          return {
            ...product,
            imageUrl: signedUrl,
            link: link,
          };
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }),
    );

    await transaction.commit();

    return successfulResponse(res, "Got Luxera AI response", {
      conversation_id: conversation.id,
      message: assistantMessageContent,
      product_cards: processedProducts,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function GetConversationsController(req: Request, res: Response) {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const { rows: conversations, count: total } =
    await Conversation.findAndCountAll({
      where: { user_id: userId },
      order: [["updatedAt", "DESC"]],
      offset: offset,
      limit: limit,
    });

  const hasMore = offset + conversations.length < total;
  return paginatedResponse(
    res,
    "User conversations retrieved",
    conversations,
    hasMore,
    page,
  );
}
export async function GetConversationByIdController(
  req: Request,
  res: Response,
) {
  const { conversationId } = req.params;
  const userId = req.user!.id;

  const conversation = await Conversation.findOne({
    where: { id: conversationId, user_id: userId },
  });

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  return successfulResponse(
    res,
    "Conversation retrieved",
    await getConversationById(conversationId),
  );
}
