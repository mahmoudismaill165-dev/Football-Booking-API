import { Response, NextFunction } from "express";

import type { AuthRequest } from "./auth.middleware.js";

import { ApiError } from "../utils/ApiError.js";

export function authorizeRoles(
  ...allowedRoles: string[]
) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      throw new ApiError(
        "Authentication required",
        401
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        "You are not allowed to access this resource",
        403
      );
    }

    next();
  };
}