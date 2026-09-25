import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(
      "Authentication required",
      401
    );
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    throw new ApiError(
      "Invalid authorization header",
      401
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: number;
      role: string;
    };

    req.user = decoded;

    next();
  } catch {
    throw new ApiError(
      "Invalid or expired token",
      401
    );
  }
}