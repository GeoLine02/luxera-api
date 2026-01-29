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
    // Get token from cookies

    const accessToken = req.cookies?.accessToken;

    // Verify token
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(accessToken, secret) as UserJwtPayload;
    if (decoded) {
      req.user = decoded;
      next();
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
      error,
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
