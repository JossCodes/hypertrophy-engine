import { AppError } from "@/core/error.js";
import { logger } from "@/core/logger.js";
import { StatusCodes } from "@/core/statusCodes.js";
import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      logger.error("Validation error:", result.error.format());
      return next(
        new AppError(StatusCodes.BAD_REQUEST, "Invalid request data"),
      );
    }

    req.body = result.data;
    return next();
  };
}
