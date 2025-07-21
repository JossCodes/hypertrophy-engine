import { AppError } from "@/core/error.js";
import { prisma } from "@/core/prisma.js";
import { StatusCodes } from "@/core/statusCodes.js";
import { hashPassword } from "@/utils/hash.js";
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
  // TODO: implement user login
}
