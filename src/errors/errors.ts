import httpStatusCodes from "./httpStatusCodes";

interface ValidationErrorsType {
  field: string;
  message: string;
}

class BaseError extends Error {
  public readonly name: string;
  public readonly message: string;
  public readonly statusCode: number;

  constructor(name: string, message: string, statusCode: number) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.message = message;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

class ValidationError extends BaseError {
  public readonly errors: ValidationErrorsType[];

  constructor(
    errors: ValidationErrorsType[],
    message: string = "Validation Error",

    statusCode = httpStatusCodes.BAD_REQUEST
  ) {
    super("ValidationError", message, statusCode);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class NotFoundError extends BaseError {
  constructor(message = "Resource Not Found") {
    super("NotFoundError", message, httpStatusCodes.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized User") {
    super("UnauthorizedError", message, httpStatusCodes.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super("BadRequestError", message, httpStatusCodes.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export {
  BaseError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ValidationErrorsType,
};
