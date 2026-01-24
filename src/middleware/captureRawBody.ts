import { NextFunction, Request, Response } from "express";

export function CaptureRawBodyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Only process BOG callback endpoint
  if (req.path !== "/bog/callback") {
    return next();
  }

  let rawBody = "";

  req.on("data", (chunk) => {
    rawBody += chunk.toString("utf8");
  });

  req.on("end", () => {
    // Store raw body before any processing
    (req as any).rawBody = rawBody;

    // Parse JSON
    try {
      req.body = JSON.parse(rawBody);
    } catch (error) {
      console.error("[ERROR] Invalid JSON in callback:", error);
      return next(error);
    }

    next();
  });
}
