import { validateRequest } from "@/middlewares/validateRequest.js";
import { Router } from "express";
import { handleLogin, handleRegister } from "./auth.controller.js";
import { LoginInputSchema, RegisterInputSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validateRequest(RegisterInputSchema), handleRegister);
router.post("/login", validateRequest(LoginInputSchema), handleLogin);

export default router;
