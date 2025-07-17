import healthRoutes from "@/modules/health/routes.js";
import { Router } from "express";

export const router = Router();
router.use("/health", healthRoutes);
