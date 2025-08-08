import { AppError } from "@/core/error.js";
import { StatusCodes } from "@/core/statusCodes.js";
import { NextFunction, Request, Response } from "express";

export function requireRole(requiredRole: "ADMIN" | "USER") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, "Authentication required"),
      );
    }

    if (req.user.role !== requiredRole) {
      return next(
        new AppError(StatusCodes.FORBIDDEN, "Insufficient permissions", true),
      );
    }

    next();
  };
}
