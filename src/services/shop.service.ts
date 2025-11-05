import sequelize from "../db";
import Shop from "../sequelize/models/shop";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import User from "../sequelize/models/user";
import jwt from "jsonwebtoken";
import { Response, Request } from "express";
interface ShopRegisterFieldsType {
  shopName: string;
  password: string;
  userId: string;
}

export async function RegisterShopService(data: ShopRegisterFieldsType) {
  try {
    sequelize.authenticate();

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const existedShop = await Shop.findOne({
      where: {
        shop_name: data.shopName,
      },
    });

    if (existedShop) {
      throw new Error("shop with this name already exists");
    }

    const registeredShop = await Shop.create({
      shop_name: data.shopName,
      password: hashedPassword,
      owner_id: data.userId,
    });

    const shopAccessToken = generateAccessToken({ id: registeredShop.id });
    const shopRefreshToken = generateRefreshToken({ id: registeredShop.id });

    return {
      shopAccessToken,
      shopRefreshToken,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Unable to register shop");
  }
}

interface ShopLoginFieldsType {
  email: string;
  password: string;
}

export async function ShopLoginService(data: ShopLoginFieldsType) {
  try {
    const existingUser = await User.findOne({
      where: {
        email: data.email,
      },
    });

    if (!existingUser) throw new Error("User with this email does not exists");

    const isCorrectpassword = bcrypt.compare(
      data.password,
      existingUser.password
    );

    if (!isCorrectpassword) throw new Error("Email or passwrod is incorrect");

    const shop = await Shop.findOne({
      where: { owner_id: existingUser.id },
    });

    if (!shop) {
      throw new Error("Shop does not exist");
    }

    const shopAccessToken = generateAccessToken({ id: shop.id });
    const shopRefreshToken = generateRefreshToken({ id: shop.id });

    return { shopAccessToken, shopRefreshToken };
  } catch (error) {
    console.log(error);
    throw new Error("Unable to Login to shop");
  }
}

export async function GetShopByTokenService(token: string | undefined) {
  try {
    if (!token) throw new Error("Token is required");

    const decodedToken = jwt.decode(token) as { id: number };

    const shopId = decodedToken.id;

    sequelize.authenticate();

    const shop = await Shop.findByPk(shopId);

    return shop;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to get shop");
  }
}

export async function RefreshAccessToken(refreshToken?: string) {
  try {
    if (!refreshToken) return null;

    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: number };

    if (!decodedToken) return null;

    const user = await User.findOne({ where: { id: decodedToken.id } });
    if (!user) return null;

    const shop = await Shop.findOne({
      where: { owner_id: user.id },
    });

    if (!shop) throw new Error("shop does not exist");

    const payload = { id: shop.id };
    const newAccessToken = generateAccessToken(payload);
    return newAccessToken;
  } catch (error) {
    console.log(error);
    return null;
  }
}

interface ShopDeleteFieldsType {
  password: string;
  userId: number;
}

export async function ShopDeleteService(
  data: ShopDeleteFieldsType,
  res: Response
) {
  try {
    if (!data.userId) {
      return res.status(400).json({
        message: "user id is required",
      });
    }

    if (!data.password || !data.password.length) {
      res.status(400).json({
        message: "Passowrd is required",
      });
    }

    const existingUser = await User.findOne({
      where: {
        id: data.userId,
      },
    });

    if (!existingUser) {
      res.status(400).json({
        message: "User does not exist",
      });
    }

    const isCorrectpassword = bcrypt.compare(
      data.password,
      existingUser?.password as string
    );

    if (!isCorrectpassword) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    const existingShop = await Shop.findOne({
      where: {
        owner_id: existingUser?.id,
      },
    });

    if (!existingShop) {
      return res.status(400).json({
        message: "Shop does not exist",
      });
    }

    const deletedShop = await Shop.destroy({
      where: {
        id: existingShop.id,
      },
    });
    if (deletedShop) {
      res.clearCookie("shopAccessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      res.clearCookie("shopRefreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(200).json({
        message: "Shop deleted successfuly",
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete shop");
  }
}
