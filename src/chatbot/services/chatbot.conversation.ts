import { GetObjectCommand, NotFound } from "@aws-sdk/client-s3";
import { Conversation } from "../../sequelize/models/conversation";
import {
  ConversationMessage,
  ConversationMessageDetails,
} from "../../sequelize/models/conversationMessage";
import { NotFoundError } from "../../errors/errors";
import {
  ConversationMessageImage,
  ConversationMessageImageAttributes,
} from "../../sequelize/models/conversationMessageImages";
import { ConversationMessageProductCard } from "../../sequelize/models/conversationMessageProductCards";
import { link } from "fs";
import ProductImages, {
  ProductImageAttributes,
} from "../../sequelize/models/productimages";
import ProductVariants, {
  ProductVariantsAttributes,
} from "../../sequelize/models/productvariants";
import Products, { ProductAttributes } from "../../sequelize/models/products";
import { GetSignedUrlFromS3 } from "../../utils/getSignedUrl";

export async function getConversationById(conversationId: string) {
  // First check if conversation exists
  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  const messages = await ConversationMessage.findAll({
    where: {
      conversation_id: conversationId,
    },

    order: [["createdAt", "ASC"]],
    include: [
      {
        model: ConversationMessageProductCard,
        as: "product_cards",
        include: [
          {
            model: ConversationMessageImage,
            as: "image",
            include: [
              {
                model: ProductImages,
                as: "image",
              },
            ],
          },
          {
            model: ProductVariants,
            as: "variant",
          },
          {
            model: Products,
            as: "product",
          },
        ],
      },
    ],
  });

  // If no messages, return empty array

  const proccessedPlainMessages = messages.map((msg) =>
    msg.get({ plain: true }),
  ) as ConversationMessageDetails[];

  if (!proccessedPlainMessages || proccessedPlainMessages.length === 0) {
    return [];
  }
  const processedMessages = await Promise.all(
    proccessedPlainMessages.map(async (message) => {
      const productCards = await Promise.all(
        message.product_cards.map(async (card) => {
          const enrichedCard = card as ConversationMessageProductCard & {
            product?: ProductAttributes;
            variant?: ProductVariantsAttributes;
            image?: ConversationMessageImageAttributes & {
              image?: ProductImageAttributes;
            };
          };
          const s3_key = enrichedCard.image?.image?.s3_key;

          let signedUrl = null;
          try {
            if (s3_key) {
              signedUrl = await GetSignedUrlFromS3(s3_key);
            }
          } catch (error) {
            throw new NotFoundError(`Image with key ${s3_key} not found in S3`);
          }

          return {
            ...enrichedCard,
            imageUrl: signedUrl,
          };
        }),
      );
      return {
        role: message.role,
        id: message.id,
        conversation_id: message.conversation_id,

        content: message.content,
        product_cards: productCards,
      };
    }),
  );

  return processedMessages;
}
