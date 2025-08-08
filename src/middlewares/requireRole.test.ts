import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../core/error.js";
import { StatusCodes } from "../core/statusCodes.js";
import { requireRole } from "./requireRole.js";

interface MockRequest extends Partial<Request> {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

describe("requireRole middleware", () => {
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = vi.fn();
  });

  describe("when user is not authenticated", () => {
    it("should call next with 401 Unauthorized error when req.user is undefined", () => {
      const middleware = requireRole("USER");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Authentication required",
        }),
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next with 401 Unauthorized error when req.user is null", () => {
      mockRequest.user = undefined;
      const middleware = requireRole("ADMIN");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Authentication required",
        }),
      );
    });
  });

  describe("when user is authenticated but has incorrect role", () => {
    it("should call next with 403 Forbidden error when USER tries to access ADMIN route", () => {
      mockRequest.user = {
        userId: "user-id-123",
        role: "USER",
      };
      const middleware = requireRole("ADMIN");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.FORBIDDEN,
          message: "Insufficient permissions",
          isOperational: true,
        }),
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next with 403 Forbidden error when ADMIN tries to access USER-only route", () => {
      mockRequest.user = {
        userId: "admin-id-456",
        role: "ADMIN",
      };
      const middleware = requireRole("USER");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.FORBIDDEN,
          message: "Insufficient permissions",
        }),
      );
    });
  });

  describe("when user has correct role", () => {
    it("should call next() without error when USER accesses USER route", () => {
      mockRequest.user = {
        userId: "user-id-123",
        role: "USER",
      };
      const middleware = requireRole("USER");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() without error when ADMIN accesses ADMIN route", () => {
      mockRequest.user = {
        userId: "admin-id-456",
        role: "ADMIN",
      };
      const middleware = requireRole("ADMIN");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("error instances", () => {
    it("should throw AppError instances with correct properties", () => {
      mockRequest.user = {
        userId: "user-id",
        role: "USER",
      };
      const middleware = requireRole("ADMIN");

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const mockNextFn = mockNext as ReturnType<typeof vi.fn>;
      const errorArg = mockNextFn.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(AppError);
      expect(errorArg.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(errorArg.message).toBe("Insufficient permissions");
      expect(errorArg.isOperational).toBe(true);
    });
  });

  describe("middleware factory function", () => {
    it("should return a function when called with role parameter", () => {
      const middleware = requireRole("USER");
      expect(typeof middleware).toBe("function");
    });

    it("should be reusable with different roles", () => {
      const userMiddleware = requireRole("USER");
      const adminMiddleware = requireRole("ADMIN");

      expect(typeof userMiddleware).toBe("function");
      expect(typeof adminMiddleware).toBe("function");
      expect(userMiddleware).not.toBe(adminMiddleware);
    });
  });
});
