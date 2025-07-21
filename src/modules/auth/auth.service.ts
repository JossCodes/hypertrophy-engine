import { AppError } from "@/core/error.js";
import { prisma } from "@/core/prisma.js";
import { StatusCodes } from "@/core/statusCodes.js";
import { hashPassword, verifyPassword } from "@/utils/hash.js";
import { signJwt } from "@/utils/jwt.js";
import { LoginInput, RegisterInput } from "./auth.validation.js";

export async function registerUser(input: RegisterInput) {
  const { email, password } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, "Email already registered");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "USER",
    },
  });

  return { userId: user.id };
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const token = signJwt({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    userId: user.id,
    role: user.role,
  };
}
