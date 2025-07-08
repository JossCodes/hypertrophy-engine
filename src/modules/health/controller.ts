import { StatusCodes } from "@/core/statusCodes.js";
import { Request, Response } from "express";

export function healthCheck(req: Request, res: Response): void {
  res.status(StatusCodes.OK).json({
    ok: true,
    message: "Hypertrophy Engine is running smoothly",
    timestamp: new Date().toISOString(),
  });
}
