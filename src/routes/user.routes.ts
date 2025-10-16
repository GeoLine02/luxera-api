import express from "express";
import {
  userByTokenController,
  UserLoginController,
  UserRegisterController,
  UserTokenRefreshController,
} from "../controller/user.controller";
import { validateRequest } from "../middleware/validateRequest";
import { registerUserSchema } from "../validators/userValidators";
const router = express.Router();

router.post(
  "/register",
  validateRequest(registerUserSchema),
  UserRegisterController
);
router.post("/login", UserLoginController);
router.get("/me", userByTokenController);
router.get("/refresh", UserTokenRefreshController);

export default router;
