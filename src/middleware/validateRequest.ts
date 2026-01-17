// middlewares/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { success, ZodError, ZodType } from "zod";
import { fi } from "zod/v4/locales";

export const validateRequest =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // validate request body
      next();
    } catch (err) {
      next(err); // pass other errors to global error handler
    }
  };
