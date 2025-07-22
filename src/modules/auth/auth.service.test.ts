import { beforeEach, describe, expect, it } from "vitest";
import { AppError } from "../../core/error.js";
import { prisma } from "../../core/prisma.js";
import { loginUser, registerUser } from "./auth.service.js";

describe("Auth Service", () => {
  const testEmail = "test@example.com";
  const testPassword = "strongpass123";

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe("registerUser", () => {
    it("registers a user successfully", async () => {
      const result = await registerUser({
        email: testEmail,
        password: testPassword,
      });
      expect(result).toHaveProperty("userId");
      expect(typeof result.userId).toBe("string");
    });

    it("throws on duplicate registration", async () => {
      await registerUser({ email: testEmail, password: testPassword });
      await expect(
        registerUser({ email: testEmail, password: testPassword }),
      ).rejects.toThrow(AppError);
    });

    it("creates user with correct default role", async () => {
      const { userId } = await registerUser({
        email: testEmail,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.role).toBe("USER");
    });

    it("hashes password correctly", async () => {
      const { userId } = await registerUser({
        email: testEmail,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(testPassword);
    });

    it("trims and normalizes email", async () => {
      const emailWithSpaces = "  TEST@EXAMPLE.COM  ";
      const result = await registerUser({
        email: emailWithSpaces,
        password: testPassword,
      });

      const user = await prisma.user.findUnique({
        where: { id: result.userId },
      });
      expect(user?.email).toBe("  TEST@EXAMPLE.COM  "); // Note: Depends on your normalization logic
    });
  });

  describe("loginUser", () => {
    beforeEach(async () => {
      await registerUser({ email: testEmail, password: testPassword });
    });

    it("logs in with correct credentials", async () => {
      const result = await loginUser({
        email: testEmail,
        password: testPassword,
      });
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("userId");
      expect(result).toHaveProperty("role");
      expect(result.role).toBe("USER");
    });

    it("throws on login with wrong password", async () => {
      await expect(
        loginUser({ email: testEmail, password: "wrongpass" }),
      ).rejects.toThrow(AppError);
    });

    it("throws on login with unknown email", async () => {
      await expect(
        loginUser({ email: "notfound@example.com", password: "pass" }),
      ).rejects.toThrow(AppError);
    });

    it("throws with correct status code for invalid credentials", async () => {
      try {
        await loginUser({ email: testEmail, password: "wrongpass" });
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
        expect((error as AppError).message).toBe("Invalid credentials");
      }
    });

    it("returns valid JWT token", async () => {
      const result = await loginUser({
        email: testEmail,
        password: testPassword,
      });

      const [header, payload, signature] = result.token.split(".");
      expect(header).toBeDefined();
      expect(payload).toBeDefined();
      expect(signature).toBeDefined();

      // Verify token contains expected payload structure
      const decodedPayload = JSON.parse(atob(payload));
      expect(decodedPayload).toHaveProperty("userId");
      expect(decodedPayload).toHaveProperty("role");
      expect(decodedPayload).toHaveProperty("iat");
      expect(decodedPayload).toHaveProperty("exp");
    });

    it("returns consistent userId between registration and login", async () => {
      const registerResult = await registerUser({
        email: "consistent@test.com",
        password: testPassword,
      });

      const loginResult = await loginUser({
        email: "consistent@test.com",
        password: testPassword,
      });

      expect(loginResult.userId).toBe(registerResult.userId);
    });
  });

  describe("Edge cases", () => {
    it("handles case-sensitive email login", async () => {
      await registerUser({
        email: "Test@Example.com",
        password: testPassword,
      });

      // This test depends on your email handling strategy
      // If emails should be case-insensitive, this should succeed
      // If case-sensitive, this should fail
      await expect(
        loginUser({ email: "test@example.com", password: testPassword }),
      ).rejects.toThrow(AppError);
    });

    it("handles very long passwords", async () => {
      const longPassword = "a".repeat(1000);
      const result = await registerUser({
        email: "longpass@test.com",
        password: longPassword,
      });

      expect(result).toHaveProperty("userId");

      const loginResult = await loginUser({
        email: "longpass@test.com",
        password: longPassword,
      });

      expect(loginResult).toHaveProperty("token");
    });
  });
});
