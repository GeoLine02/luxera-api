// controllers/user/userRegister.controller.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  RegisterUserService,
  UserLoginService,
} from "../services/user.service";

export async function UserRegisterController(req: Request, res: Response) {
  try {
    // 1️⃣ Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log("req: ", req.body);

    // 2️⃣ Call the service to register the user
    const user = await RegisterUserService(req.body);

    // 3️⃣ Respond with success
    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong while registering the user",
      error: error.message,
    });
  }
}

export async function UserLoginController(req: Request, res: Response) {
  try {
    const data = req.body;

    const result = await UserLoginService(data);

    // If your service throws an error, this line won’t run
    // So we can safely assume result exists and is valid
    return res.status(200).json({
      message: result.message,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    console.error("Login controller error:", error);
    return res.status(500).json({
      message: "Something went wrong while logging in",
      error: error.message,
    });
  }
}
