import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodSchema } from "zod";

export function validate(
  schema: ZodSchema,
  target: "body" | "query" = "body"
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data =
      target === "body"
        ? req.body
        : req.query;

    const result = schema.safeParse(data);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (target === "body") {
      req.body = result.data;
    } else {
      res.locals.validatedQuery = result.data;
    }

    next();
  };
}