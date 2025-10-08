import sequelize from "../db";
import Shop from "../sequelize/models/shop";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import User from "../sequelize/models/user";
import jwt from "jsonwebtoken";
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
    sequelize.authenticate();

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

    const shopAccessToken = generateAccessToken({ id: existingUser.id });
    const shopRefreshToken = generateRefreshToken({ id: existingUser.id });

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

interface ShopDeleteFieldsType {
  password: string;
  userId: number;
}

export async function ShopDeleteService(data: ShopDeleteFieldsType) {
  try {
    if (!data.password || !data.password.length)
      throw new Error("Password is required");

    sequelize.authenticate();

    const existingUser = await User.findOne({
      where: {
        id: data.userId,
      },
    });

    if (!existingUser) throw new Error("shop does not exist");

    const isCorrectpassword = bcrypt.compare(
      data.password,
      existingUser.password
    );

    if (!isCorrectpassword) throw new Error("Incorrect password");

    const existingShop = await Shop.findOne({
      where: {
        owner_id: existingUser.id,
      },
    });

    if (!existingShop) throw new Error("Shop does not exist");

    const deletedShop = await Shop.destroy({
      where: {
        owner_id: existingShop.owner_id,
      },
    });

    return deletedShop;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete shop");
  }
}
