// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { BaseError, ValidationError } from "../errors/errors";
import { ApiResponse } from "../types/apiResponse";
import httpStatusCodes from "../errors/httpStatusCodes";
import logger from "../logger";

function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

  // Determine if it's an operational error
  const isOperationalError = error instanceof BaseError;

  // Log errors with appropriate level
  if (isOperationalError) {
    // Operational errors (expected) - log as warning
    logger.warn(`Operational Error: ${error.name} - ${error.message}`, {
      url: req.url,
      method: req.method,
      statusCode: (error as BaseError).statusCode,
      ip: req.ip,
    });
  } else {
    // System/programming errors (unexpected) - log as error
    logger.error(`Unexpected Error: ${error.name} - ${error.message}`, {
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      error: {
        name: "ValidationError",
        message: "Validation failed",
        errors: formattedErrors,
      },
    });
  }

  // Handle custom ValidationError

  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
        errors: error.errors,
      },
    });
  }
  

  // Handle other custom BaseErrors
  if (error instanceof BaseError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
      },
    });
  }

  // Unknown/internal errors - don't expose details to user
  return res.status(httpStatusCodes.INTERNAL_SERVER).json({
    success: false,
    error: {
      name: "InternalServerError",
      message: "Something went wrong. Please try again later.",
    },
  });
}

export default errorHandler;
