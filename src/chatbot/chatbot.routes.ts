import e from "express";
import { AskAssistantController } from "./chatbot.controller";
const router = e.Router();
router.post("/chat", AskAssistantController);

export default router;
