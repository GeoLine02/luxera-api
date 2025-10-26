import sequelize from "../db";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import User from "../sequelize/models/user";

interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
}

export async function RegisterUserService(
  data: RegisterUserInput,
  res: Response
) {
  try {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists", status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      full_name: data.fullName,
      email: data.email,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = newUser.get({ plain: true });
    return res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("RegisterUserService error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to register user" });
  }
}

interface LoginUserInput {
  email: string;
  password: string;
}

export async function UserLoginService(data: LoginUserInput, res: Response) {
  try {
    const { email, password } = data;

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({
        error: "User with this email does not exist",
      });
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      return res.status(400).json({
        error: "Email or password is not correct",
      });
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(203).json({
      message: "Login successful",
      status: 203,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to login",
    });
  }
}

export async function UserTokenRefreshService(
  refreshToken: string | undefined,
  res: Response
) {
  try {
    if (!refreshToken) {
      return res.json(null);
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;

    // Find user
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new access token
    const payload = { id: user.id, email: user.email };

    const newAccessToken = generateAccessToken(payload);

    // Set access token in cookie
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res
      .status(200)
      .json({ message: "Access token refreshed", accessToken: newAccessToken });
  } catch (error: any) {
    console.log(error);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function UserByTokenService(
  accessToken: string | undefined,
  res: Response
) {
  try {
    if (!accessToken) {
      return res.status(401).json({ message: "Access token required" });
    }

    let decodedToken: JwtPayload;
    try {
      // verify token
      decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
    } catch (err) {
      console.log(err);
      return res.status(401).json({ message: "Unauthorized or expired token" });
    }

    const user = await User.findOne({ where: { id: decodedToken.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
