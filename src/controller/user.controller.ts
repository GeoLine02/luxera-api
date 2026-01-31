import { Request, Response } from "express";

import {
  RegisterUserService,
  UserByTokenService,
  UserLoginService,
  UserTokenRefreshService,
} from "../services/user.service";
import { BadRequestError, ValidationError } from "../errors/errors";
import nodemailer from "nodemailer";
import Verifications from "../sequelize/models/verifications";
import { generateOTP, OTP_LENGTH } from "../constants/constants";
import { successfulResponse } from "../utils/responseHandler";
import { User } from "../sequelize/models/associate";
import { where } from "sequelize";
import { sendEmail } from "../utils/sendEmail";
import sequelize from "../db";

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
  const contactEmail = "noreply@contact.luxeragift.com";
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

  const verification = await Verifications.findOne({
    where: {
      email: email,
    },
  });

  if (!verification) {
    throw new ValidationError([
      {
        field: "code",
        message: "Invalid code",
      },
    ]);
  }

  if (Date.now() > verification.expires_at.getTime()) {
    // Delete expired verification
    await verification.destroy();
    throw new ValidationError([
      {
        field: "code",
        message: "Code expired. Request a new one.",
      },
    ]);
  }

  // ❌ ISSUE 4: No attempt tracking
  // User can brute force unlimited times. Add:
  if (verification.attempts >= verification.max_attempts) {
    throw new ValidationError([
      {
        field: "code",
        message: "Too many attempts. Request a new code.",
      },
    ]);
  }

  if (verification.otp !== code) {
    // ❌ ISSUE 5: Increment attempts on wrong code
    verification.attempts += 1;
    await verification.save();

    throw new BadRequestError(
      `Code is incorrect. ${verification.max_attempts - verification.attempts} attempts remaining`,
    );
  }
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
    await verification.destroy({ transaction });
    const verifiedUser = await User.findByPk(userId);
    await transaction.commit();

    return successfulResponse(res, "Email verified successfully", verifiedUser);
    // ✅ Delete verification record
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    throw error;
  }
}
