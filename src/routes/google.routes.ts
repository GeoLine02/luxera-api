import express from "express";
import {
  googleLoginController,
  googleCallbackController,
} from "../controller/google.controller";

const router = express.Router();

router.get("/login", googleLoginController);
router.get("/callback", googleCallbackController);

export default router;
