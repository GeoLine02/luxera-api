import express from "express";
import {
  SendVerificationCodeController,
  userByTokenController,
  UserLoginController,
  UserRegisterController,
  UserTokenRefreshController,
  VerifyUserController,
} from "../controller/user.controller";
import { validateRequest } from "../middleware/validateRequest";
import { registerUserSchema } from "../validators/userValidators";
import { authGuard } from "../middleware/authGuard";
const router = express.Router();

router.post(
  "/register",
  validateRequest(registerUserSchema),
  UserRegisterController,
);
router.post("/send-code", authGuard, SendVerificationCodeController);
router.post("/verify", authGuard, VerifyUserController);
router.post("/login", UserLoginController);
router.get("/me", userByTokenController);
router.get("/refresh", UserTokenRefreshController);

export default router;
