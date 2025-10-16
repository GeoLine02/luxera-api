import { Request, Response } from "express";

import {
  RegisterUserService,
  UserLoginService,
  UserTokenRefreshService,
} from "../services/user.service";

export async function UserRegisterController(req: Request, res: Response) {
  try {
    const response = await RegisterUserService(req.body, res);

    return response;
  } catch (error: any) {
    console.error(error);
  }
}

export async function UserLoginController(req: Request, res: Response) {
  try {
    const response = await UserLoginService(req.body, res);
    return response;
  } catch (error) {
    console.error(error);
  }
}

export async function UserTokenRefreshController(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    const response = await UserTokenRefreshService(refreshToken, res);

    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function userByTokenController() {}
