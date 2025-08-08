import { AppError } from "@/core/error.js";
import { StatusCodes } from "@/core/statusCodes.js";
import { verifyJwt } from "@/utils/jwt.js";
import { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "No token provided");
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "No token provided");
    }

    const decoded = verifyJwt<{ userId: string; role: "USER" | "ADMIN" }>(
      token,
    );

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token"));
    }
  }
}
