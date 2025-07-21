import { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service.js";

export async function handleRegister(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
