import { getEnv } from "@/core/env.js";
import { AppError } from "@/core/error.js";
import { Request, Response } from "express";

export function errorHandler(err: unknown, req: Request, res: Response) {
  const env = getEnv();
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

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
