import { Request, Response } from "express";
import {
  RegisterShopService,
  ShopDeleteService,
  ShopLoginService,
} from "../services/shop.service";

export async function ShopRegisterController(req: Request, res: Response) {
  try {
    const body = req.body;

    const registeredShop = await RegisterShopService(body);

    if (registeredShop) {
      res.cookie("shopAccessToken", registeredShop.shopAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      res.cookie("shopRefreshToken", registeredShop.shopRefreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json(registeredShop);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function ShopLoginController(req: Request, res: Response) {
  try {
    const body = req.body;
    const loggedInShop = await ShopLoginService(body);

    if (loggedInShop) {
      res.cookie("shopAccessToken", loggedInShop.shopAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      res.cookie("shopRefreshToken", loggedInShop.shopRefreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(203).json(loggedInShop);
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function GetShopByTokenController(req: Request, res: Response) {
  try {
    const headers = req.headers.authorization;

    const tokens = headers?.split(" ");
    console.log(tokens);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function ShopDeleteController(req: Request, res: Response) {
  try {
    const query = req.query;

    const data = {
      password: query.password as string,
      userId: Number(query.userId) as number,
    };

    const deletedShop = await ShopDeleteService(data);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
