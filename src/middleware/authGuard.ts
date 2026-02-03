// middlewares/authGuard.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface UserJwtPayload extends jwt.JwtPayload {
  id: number;
  email: string;
}

export interface ShopJwtPayload extends jwt.JwtPayload {
  id: number;
}

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1️⃣ Try cookie-parser first
    let accessToken = req.cookies?.accessToken;

    // 2️⃣ Fallback: manually parse req.headers.cookie
    if (!accessToken && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split("; ").map((cookie) => cookie.split("=")),
      );
      accessToken = cookies.accessToken;
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No access token provided",
      });
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");

    const decoded = jwt.verify(accessToken, secret) as UserJwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

export const shopAuthGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shopAccessToken = req.cookies.shopAccessToken;

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(shopAccessToken, secret) as ShopJwtPayload;
    if (decoded) {
      req.shop = decoded;
      next();
    }
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid Shop token" });
  }
};
