import e from "express";
import {
  bogCallbackController,
  bogRequestOrderController,
} from "./bog.controller";
const router = e.Router();
router.post("/callback", bogCallbackController);

export default router;
