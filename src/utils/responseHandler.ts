import { Response } from "express";
import httpStatusCodes from "../errors/httpStatusCodes";
import { PAGE_SIZE } from "../constants/constants";

export function successfulResponse(
  res: Response,

  message: string = "Successful Operation",
  data: any
) {
  return res.status(httpStatusCodes.OK).json({
    success: true,
    message: message,
    data: data,
  });
}
export function paginatedResponse(
  res: Response,
  message: string = "Successful paginated operation",
  data: any,
  hasMore: boolean,
  page: number
) {
  return res.status(httpStatusCodes.OK).json({
    success: true,
    message: message,
    data: data,
    hasMore,
    page,
    pageSize: PAGE_SIZE,
  });
}
export function errorResponse(res: Response, error: any, message: string) {
  return res.status(httpStatusCodes.INTERNAL_SERVER).json({
    success: false,
    message: message,
    error: error,
  });
}
