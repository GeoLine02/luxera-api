import { Request, Response } from "express";

import {
  RegisterUserService,
  UserByTokenService,
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
    const authHeaders = req.headers?.authorization;

    const refreshToken = authHeaders?.split(" ")?.[1];

    const response = await UserTokenRefreshService(refreshToken, res);

    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function userByTokenController(req: Request, res: Response) {
  try {
    const authHeaders = req.headers?.authorization;
    const accessToken = authHeaders?.split(" ")?.[1];
    const response = await UserByTokenService(accessToken, res);

    return response;
  } catch (error) {
    console.log(error);
  }
}
