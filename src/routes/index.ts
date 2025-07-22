import authRoutes from "@/modules/auth/auth.routes.js";
import healthRoutes from "@/modules/health/routes.js";
import { Router } from "express";

export const router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
