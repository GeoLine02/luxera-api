import e from "express";
import {
  bogCallbackController,
  bogRequestOrderController,
} from "./bog.controller";
const router = e.Router();
router.get("/callback", bogCallbackController);

export default router;
