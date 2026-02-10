import { NextFunction, Request, Response } from "express";

export function captureRawBodyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.path !== "/payments/bog/callback") {
    return next();
  }

  const chunks: Buffer[] = [];

  req.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on("end", () => {
    const rawBuffer = Buffer.concat(chunks);
    (req as any).rawBody = rawBuffer; // ← Buffer, exact bytes BOG signed
    // Optional: parse JSON only after verification (but for convenience you can parse now)
    try {
      req.body = JSON.parse(rawBuffer.toString("utf8"));
    } catch (err) {
      console.error("[BOG Callback] Invalid JSON:", err);
      // Still continue – verify sig first if possible
    }
    next();
  });
  req.on("error", (err) => {
    console.error("[BOG Callback] Stream error:", err);
    next(err);
  });
}
