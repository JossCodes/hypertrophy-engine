import { getEnv } from "@/core/env.js";
import { AppError } from "@/core/error.js";
import { logger } from "@/core/logger.js";
import { Request, Response } from "express";

export function errorHandler(err: unknown, req: Request, res: Response) {
  const env = getEnv();
  if (err instanceof AppError) {
    if (env.NODE_ENV !== "test") {
      logger.warn(
        `[AppError] ${err.statusCode} ${req.method} ${req.url} → ${err.message}`,
      );
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // unexpected error
  logger.error(
    `[Unexpected Error] ${req.method} ${req.url} → ${err instanceof Error ? err.message : "Unknown error"}`,
  );

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err instanceof Error
          ? err.message
          : "Unknown error",
  });
}
