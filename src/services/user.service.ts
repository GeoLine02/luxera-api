import sequelize from "../db";
import bcrypt from "bcrypt";
import User from "../models/user";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
}

export async function RegisterUserService(data: RegisterUserInput) {
  try {
    await sequelize.authenticate();

    console.log("data", data);

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
