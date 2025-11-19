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
      if (err instanceof ZodError) {
       const formattedErrors = err.issues.map((issue)=>{
        return {
          field: issue.path.join('.'),
          message: issue.message
        }
       })
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
          validationErrors: formattedErrors 
        });
      }
      next(err); // pass other errors to global error handler
    }
  };
