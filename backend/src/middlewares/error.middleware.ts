import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ApiError } from "../utils/ApiError.js";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: {
        message: error.message || "Internal Server Error",
        statusCode: 500,
      },
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: {
      message: "Internal server error",
      statusCode: 500,
    },
  });
}