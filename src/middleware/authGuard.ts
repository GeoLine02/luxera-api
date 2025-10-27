// middlewares/authGuard.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  email: string;
}

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(accessToken, secret) as JwtPayload;

    // Attach user info to request for later use
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
