import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { findOrCreateGoogleUser } from "../services/google.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const oauthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// 1️⃣ Redirect user to Google
export function googleLoginController(req: Request, res: Response) {
  const url = oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });

  res.redirect(url);
}

// 2️⃣ Google redirects back here
export async function googleCallbackController(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send("Missing code");
    }

    // Exchange code → tokens
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    // Verify ID token (backend only)
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name || !payload.sub) {
      throw new Error("Invalid Google payload");
    }

    const { email, name, sub: googleId, picture } = payload;

    // Find or create user
    const user = await findOrCreateGoogleUser({
      email,
      name,
      googleId,
      picture,
    });

    // Issue YOUR tokens (example)
    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Redirect back to frontend
    res.redirect(
      process.env.NODE_ENV === "production"
        ? process.env.PROD_FRONTEND_URL!
        : "http://localhost:3000",
    );
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3000/auth/error");
  }
}
