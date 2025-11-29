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
    sequelize.authenticate();
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const email = data.email.toLocaleLowerCase();
    const [newUser, created] = await User.findOrCreate({
      where: { email: email },
      defaults: {
        full_name: data.fullName,
        email: email,
        password: hashedPassword,
      },
    });

    if (!created) {
      console.error("Register Failed: User with this email already exists");
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const { password, ...userWithoutPassword } = newUser.get({ plain: true });
    const payload = {
      id: newUser.id,
      email: newUser.email,
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
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error("RegisterUserService error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
}

interface LoginUserInput {
  email: string;
  password: string;
}

export async function UserLoginService(data: LoginUserInput, res: Response) {
  try {
    const { email, password } = data;

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message: "Email or password is not correct",
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(203).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
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
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;

    // Find user
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
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

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: { accessToken: newAccessToken },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
}

export async function UserByTokenService(accessToken: string, res: Response) {
  try {
    let decodedToken: JwtPayload;

    try {
      // Verify token
      decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
    } catch (err: any) {
      console.error("Token verification failed:", err.message);

      // Differentiate between expired and invalid tokens
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        message: "Invalid access token",
        code: "INVALID_TOKEN",
      });
    }

    // Fetch user from database
    const user = await User.findOne({
      where: { id: decodedToken.id },
      attributes: { exclude: ["password"] }, // Don't send password to frontend
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Error in UserByTokenService:", error);
    return res.status(500).json({
      success: false,

      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
}
