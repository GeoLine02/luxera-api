import e from "express";
import {
  AskAssistantController,
  GetConversationByIdController,
  GetConversationsController,
  StartConversationController,
} from "./chatbot.controller";
import { authGuard } from "../middleware/authGuard";
import { validateRequest } from "../middleware/validateRequest";
import { userPromptSchema } from "../validators/chatbot.validators";
const router = e.Router();

router.post(
  "/conversations/new",
  authGuard,
  validateRequest(userPromptSchema),
  StartConversationController,
);
router.get(
  "/conversations/:conversationId/load-responses",
  authGuard,
  GetConversationByIdController,
);

router.post(
  "/conversations/:conversationId/respond",
  authGuard,
  validateRequest(userPromptSchema),
  AskAssistantController,
);
router.get("/conversations", authGuard, GetConversationsController);

export default router;
