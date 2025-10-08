// middlewares/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

export const validateRequest =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // validate request body
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map((issue) => ({
          field: issue.path.join("."), // supports nested paths
          message: issue.message,
        }));
        return res.status(400).json({ errors: formattedErrors });
      }
      next(err); // pass other errors to global error handler
    }
  };
