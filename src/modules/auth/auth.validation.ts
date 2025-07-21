import { z } from "zod";

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
