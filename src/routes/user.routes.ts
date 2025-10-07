import express from "express";
import {
  UserLoginController,
  UserRegisterController,
} from "../controller/user.controller";
const router = express.Router();

router.post("/register", UserRegisterController);
router.post("/login", UserLoginController);

export default router;
