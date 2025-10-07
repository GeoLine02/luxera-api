import express from "express";
import {
  UserByTokenController,
  UserLoginController,
  UserRegisterController,
  UserTokenRefreshController,
} from "../controller/user.controller";
const router = express.Router();

router.post("/register", UserRegisterController);
router.post("/login", UserLoginController);
router.get("/me", UserByTokenController);
router.get("/refresh", UserTokenRefreshController);

export default router;
