import sequelize from "../db";
import Shop from "../sequelize/models/shop";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import User from "../sequelize/models/user";
import jwt from "jsonwebtoken";
import { Response, Request } from "express";
import { th } from "zod/v4/locales";
import createError from "../utils/error";
import { create } from "domain";
import Products from "../sequelize/models/products";
import ProductVariants from "../sequelize/models/productvariants";
import { PAGE_SIZE } from "../constants/constants";
import Cities from "../sequelize/models/cities";
interface ShopRegisterFieldsType {
  shopName: string;
  password: string;
}

export async function RegisterShopService(
  data: ShopRegisterFieldsType,
  req: Request,
  res: Response
) {
  try {
    sequelize.authenticate();

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const existedShop = await Shop.findOne({
      where: {
        shop_name: data.shopName,
      },
    });

    if (existedShop) {
      throw createError(`Shop "${data.shopName}" already exists`, 400);
    }
    const userId = req.user?.id;
    // check if user already has a shop
    const userShop = await Shop.findOne({
      where: {
        owner_id: userId,
      },
    });
    if (userShop) {
      throw createError("User already has a shop", 400);
    }
    const registeredShop = await Shop.create({
      shop_name: data.shopName,
      password: hashedPassword,
      owner_id: userId,
    });

    if (registeredShop) {
      await User.update(
        { role: "seller" },
        {
          where: {
            id: userId,
          },
        }
      );
    }

    const shopAccessToken = generateAccessToken({ id: registeredShop.id });
    const shopRefreshToken = generateRefreshToken({ id: registeredShop.id });
    return {
      shopAccessToken,
      shopRefreshToken,
    };
  } catch (error: any) {
    const err = new Error(error.message);
    if (error.status) {
      (err as any).status = error.status;
    }
    throw err;
  }
}

export async function ShopLoginService(password: string, req: Request) {
  try {
    const userId = req.user!.id;

    const shop = await Shop.findOne({
      where: {
        owner_id: userId,
      },
    });
    if (!shop) {
      throw createError("Shop for this user does not exist", 404);
    }
    const isCorrectPassword = await bcrypt.compare(
      password,
      shop.password as string
    );

    if (!isCorrectPassword) {
      throw createError("Incorrect password", 400);
    }
    const shopAccessToken = generateAccessToken({ id: shop.id });
    const shopRefreshToken = generateRefreshToken({ id: shop.id });

    return { shopAccessToken, shopRefreshToken };
  } catch (error: any) {
    const err = new Error(error.message);
    if (error.status) {
      (err as any).status = error.status;
    }
    throw err;
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

    const shop = await Shop.findOne({
      where: { id: decodedToken.id },
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
}

export async function ShopDeleteService(
  data: ShopDeleteFieldsType,
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!data.password || !data.password.length) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const existingShop = await Shop.findOne({
      where: {
        owner_id: userId,
      },
    });

    if (!existingShop) {
      return res.status(400).json({
        success: false,
        message: "Shop does not exist",
      });
    }

    const isCorrectpassword = await bcrypt.compare(
      data.password,
      existingShop?.password as string
    );

    if (!isCorrectpassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const deletedShopId = await Shop.destroy({
      where: {
        id: existingShop.id,
      },
    });
    if (deletedShopId) {
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

      return res.status(204).json({
        success: true,
        message: "Shop deleted successfully",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete shop",
    });
  }
}

export async function getShopByIdService(req: Request, res: Response) {
  try {
    const shopId = req.params.shopId;

    const existingShop = await Shop.findOne({
      where: { id: shopId },
      limit: PAGE_SIZE,
      include: [
        {
          model: Products,
          as: "products",
          include: [
            {
              model: ProductVariants,
              as: "primaryVariant",
            },
          ],
        },
      ],
    });

    if (!existingShop) {
      return res.status(404).json({
        success: false,
        message: "Shop does not exist",
      });
    }

    return res.status(200).json({
      success: true,
      data: existingShop,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "unable to get shop by id",
      error,
    });
  }
}

export async function updateShopLocationService(req: Request, res: Response) {
  try {
    const { locationId, customCity } = req.body; // partial update
    const shopId = req.shop?.id;

    // Fetch existing shop
    const existingShop = await Shop.findOne({ where: { id: shopId } });
    if (!existingShop) {
      return res.status(404).json({
        success: false,
        message: "Shop does not exist",
      });
    }

    // Validate input
    if (locationId && customCity) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot set both a city and a custom city name at the same time",
      });
    }

    if (!locationId && !customCity) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a city or a custom city name",
      });
    }

    const updateData: {
      city_id?: number | null;
      custom_city_name?: string | null;
    } = {};

    if (locationId) {
      // Validate that city exists
      const city = await Cities.findByPk(locationId);
      if (!city) {
        return res.status(400).json({
          success: false,
          message: "Selected city does not exist",
        });
      }
      updateData.city_id = locationId;
      updateData.custom_city_name = null; // clear custom city if previously set
    }

    if (customCity) {
      updateData.custom_city_name = customCity;
      updateData.city_id = null; // clear city_id if previously set
    }

    // Update shop
    const [_, [updatedShop]] = await Shop.update(updateData, {
      where: { id: shopId },
      returning: true,
    });

    return res.status(200).json({
      success: true,
      message: "Shop location updated successfully",
      data: updatedShop,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Unable to update shop location",
      error: err instanceof Error ? err.message : err,
    });
  }
}
