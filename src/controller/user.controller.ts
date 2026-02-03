import { Request, Response } from "express";

import {
  RegisterUserService,
  UserByTokenService,
  UserLoginService,
  UserTokenRefreshService,
  VerifyOtpViaEmail,
} from "../services/user.service";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";
import jwt from "jsonwebtoken";
import Verifications from "../sequelize/models/verifications";
import { generateOTP, OTP_LENGTH } from "../constants/constants";
import { successfulResponse } from "../utils/responseHandler";
import { User } from "../sequelize/models/associate";
import { where } from "sequelize";
import { sendEmail } from "../utils/sendEmail";
import sequelize from "../db";
import { generateAccessToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { registerUserSchema } from "../validators/userValidators";
import { ZodError } from "zod";

export async function UserRegisterController(req: Request, res: Response) {
  try {
    const response = await RegisterUserService(req.body, res);

    return response;
  } catch (error: any) {
    console.error(error);
  }
}

export async function UserLoginController(req: Request, res: Response) {
  try {
    const response = await UserLoginService(req.body, res);
    return response;
  } catch (error) {
    console.error(error);
  }
}

export async function UserTokenRefreshController(req: Request, res: Response) {
  try {
    const authHeaders = req.headers?.authorization;

    const refreshToken = authHeaders?.split(" ")?.[1];

    const response = await UserTokenRefreshService(refreshToken, res);

    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function userByTokenController(req: Request, res: Response) {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const user = await UserByTokenService(accessToken, res);
    return user;
  } catch (error) {
    console.error("Error in userByTokenController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function SendVerificationCodeController(
  req: Request,
  res: Response,
) {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId || !email) {
    throw new Error("Could not resolve user email and id");
  }

  await Verifications.destroy({
    where: { email: email },
  });

  const code = generateOTP(OTP_LENGTH);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Verifications.create({
    email: email,
    expires_at: expiresAt,
    otp: code,
  });
  const contactEmail = process.env.CONTACT_EMAIL!;
  await sendEmail(email, code, contactEmail);
  return successfulResponse(res, `Verification Code Sent to ${email}`, null);
}

export async function VerifyUserController(req: Request, res: Response) {
  const code = req.body.code;
  const userId = req.user?.id;

  const email = req.user?.email;

  if (!code) {
    throw new ValidationError([
      {
        field: "code",
        message: "code is required",
      },
    ]);
  }

  if (!email || !userId) {
    throw new Error("Could not resolve email or user id");
  }

  await VerifyOtpViaEmail(email, code);
  const transaction = await sequelize.transaction();
  try {
    // ✅ Code is correct - update user
    const updatedUser = await User.update(
      { email_verified: true, email_verified_at: new Date() },
      { where: { id: userId }, transaction },
    );
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }
    await Verifications.destroy({
      where: {
        email: email,
      },
    });
    const verifiedUser = await User.findByPk(userId);

    await transaction.commit();

    return successfulResponse(res, "Email verified successfully", verifiedUser);
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    throw error;
  }
}
export async function UserForgotPasswordController(
  req: Request,
  res: Response,
) {
  const { email } = req.body;
  if (!email) {
    throw new ValidationError([
      {
        field: "email",
        message: "Invalid email",
      },
    ]);
  }
  // find user
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // send code
  const code = generateOTP(OTP_LENGTH);
  // create verification
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Verifications.create({
    email: email,
    expires_at: expiresAt,
    otp: code,
  });
  await sendEmail(email, code, process.env.CONTACT_EMAIL!);
  return successfulResponse(res, `Verification Code Sent to ${email}`, null);
}

export async function UserChangePasswordController(
  req: Request,
  res: Response,
) {
  let accessToken = req.cookies?.accessToken;
  // 2️⃣ Fallback: manually parse req.headers.cookie
  if (!accessToken && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split("; ").map((cookie) => cookie.split("=")),
    );
    accessToken = cookies.accessToken;
  }
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No access token provided",
    });
  }
  interface Jwt {
    email: string;
  }
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");

  const decoded = jwt.verify(accessToken, secret) as Jwt;

  const { newPassword } = req.body;
  try {
    registerUserSchema.shape.password.parse(newPassword);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      throw new ValidationError([
        {
          field: "password",
          message: firstIssue.message,
        },
      ]);
    }
  }
  const user = await User.findOne({
    where: {
      email: decoded.email,
    },
  });
  if (!user) {
    throw new NotFoundError("User not Found");
  }
  // update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await user.update({
    password: hashedPassword,
  });

  return successfulResponse(res, "Updated User password", updatedUser);
}
export async function UserLogoutController(req: Request, res: Response) {
  res.clearCookie("accessToken");
  res.clearCookie("shopAccessToken");
  return successfulResponse(res, "User Logged out", null);
}
export async function UserForgotPasswordVerifyController(
  req: Request,
  res: Response,
) {
  const { email, code } = req.body;
  if (!code) {
    throw new ValidationError([
      {
        field: "code",
        message: "code is required",
      },
    ]);
  }
  if (!email) {
    throw new ValidationError([
      {
        field: "email",
        message: "email is required or invalid",
      },
    ]);
  }
  await VerifyOtpViaEmail(email, code);
  await Verifications.destroy({
    where: {
      email: email,
    },
  });

  const payload = {
    email: email,
  };

  const accessToken = generateAccessToken(payload);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 min
  });
  return successfulResponse(res, "Email verified successfully", accessToken);
}
