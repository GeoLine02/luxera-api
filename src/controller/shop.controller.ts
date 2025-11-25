import { Request, Response } from "express";
import {
  RefreshAccessToken,
  RegisterShopService,
  ShopDeleteService,
  ShopLoginService,
} from "../services/shop.service";
import Shop from "../sequelize/models/shop";

export async function ShopRegisterController(req: Request, res: Response) {
  try {
    const body = req.body;
  
    const registeredShop = await RegisterShopService(body,req,res);

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

      return res.status(201).json({
        success: true,
        message: "Shop registered successfully",
        data: registeredShop,
      });
    }
  } catch (error: any) {
    const status = error.status as number || 500
    console.log(error)
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function ShopLoginController(req: Request, res: Response) {
  try {
    const password = req.query.password as string;
    if(!password){
      return res.status(400).json({
        success:false,
        message:"Password is required"
      })
    }
    const loggedInShop = await ShopLoginService(password,req);

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


      return res.status(203).json({
        success: true,
        message: "Shop logged in successfully",
        data: loggedInShop,
      });
    }
  } catch (error: any) {
  
     const status = error.status as number || 500
     console.log(error)
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function RefreshShopAccessTokenController(
  req: Request,
  res: Response
) {
  try {
    const authHeaders = req.headers?.authorization;
    const refreshToken = authHeaders?.split(" ")?.[1];

    const refreshedToken = await RefreshAccessToken(refreshToken);

    if (!refreshedToken) {
      return res.status(401).json({
        success: false,
        message: "Expired or missing refresh token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: { shopAccessToken: refreshedToken },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function GetShopByTokenController(req: Request, res: Response) {
  try {
    const shopId = req.shop!.id
    console.log("shop id", shopId)
   const shopData = await Shop.findByPk(shopId,{
     attributes:{exclude:["password"]}  //exclude password
   })

   return res.status(200).json({
    success:true,
    message:"Shop fetched successfully",
    data:shopData
   })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function ShopDeleteController(req: Request, res: Response) {
  try {
    const query = req.query;
    console.log(query);
    const data = {
      password: query.password as string,
    };

    const deletedShop = await ShopDeleteService(data,req, res);
    return deletedShop;
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
