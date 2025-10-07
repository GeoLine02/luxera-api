import sequelize from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import User from "../sequelize/models/user";

interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
}

export async function RegisterUserService(data: RegisterUserInput) {
  try {
    await sequelize.authenticate();

    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      full_name: data.fullName,
      email: data.email,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = newUser.get({ plain: true });
    return userWithoutPassword;
  } catch (error: any) {
    console.error("RegisterUserService error:", error);
    throw new Error(error.message || "Failed to register user");
  }
}

interface LoginUserInput {
  email: string;
  password: string;
}

export async function UserLoginService(data: LoginUserInput) {
  try {
    await sequelize.authenticate();

    const { email, password } = data;

    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      throw new Error("User with this email does not exist");
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      throw new Error("Email or password is not correct");
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function UserTokenRefreshService(
  accessToken: string | undefined,
  refrehToken: string | undefined
) {
  if (!accessToken) {
    throw new Error("Access Token is required");
  }

  const isValidToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET!
  );

  if (!isValidToken && refrehToken) {
    const decodedRefreshToken = jwt.decode(refrehToken) as {
      id: number;
      email: string;
    };

    const payload = {
      id: decodedRefreshToken.id,
      email: decodedRefreshToken.email,
    };

    const newAccessToken = generateAccessToken(payload);

    return newAccessToken;
  }

  try {
  } catch (error) {
    console.log(error);
    throw new Error("Unable to refesh token");
  }
}

export async function UserByTokenService(token: string | undefined) {
  try {
    if (!token) {
      throw new Error("Token is required");
    }

    const decodedToken = jwt.decode(token) as { id: number; email: string };
    const userId = decodedToken?.id;

    sequelize.authenticate();

    const user = await User.findByPk(userId);

    return user;
  } catch (error) {
    throw new Error("Unable to Fetch User by Token");
  }
}
