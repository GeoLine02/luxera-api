// controllers/user/userRegister.controller.ts
import { Request, Response } from "express";

import {
  RegisterUserService,
  UserByTokenService,
  UserLoginService,
  UserTokenRefreshService,
} from "../services/user.service";

export async function UserRegisterController(req: Request, res: Response) {
  try {
    const user = await RegisterUserService(req.body);

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

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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

export async function UserTokenRefreshController(req: Request, res: Response) {
  try {
    const cookie = req.headers.cookie;

    const cookies = cookie
      ?.split("; ")
      .reduce<Record<string, string>>((acc, item) => {
        const [key, value] = item.split("=");
        acc[key] = value;
        return acc;
      }, {});

    const accessToken = cookies?.["accessToken"];
    const refreshToken = cookies?.["refreshToken"];

    const newAcceesToken = await UserTokenRefreshService(
      accessToken,
      refreshToken
    );

    return res.status(200).json({
      accessToken: newAcceesToken,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function UserByTokenController(req: Request, res: Response) {
  try {
    const headers = req.headers["authorization"];
    const token = headers?.split(" ")[1];

    const user = await UserByTokenService(token);

    return res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
