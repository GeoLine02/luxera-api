import { ValidationErrorsType } from "../errors/errors";

// types/apiResponse.ts
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    errors?: ValidationErrorsType[];
    code?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
