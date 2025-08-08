import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../core/error.js";
import { StatusCodes } from "../core/statusCodes.js";
import { verifyJwt } from "../utils/jwt.js";
import { requireAuth } from "./requireAuth.js";

vi.mock("../utils/jwt.js", () => ({
  verifyJwt: vi.fn(),
}));

const mockVerifyJwt = vi.mocked(verifyJwt);

interface MockRequest extends Partial<Request> {
  headers: {
    authorization?: string;
  };
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

describe("requireAuth middleware", () => {
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("when no authorization header is provided", () => {
    it("should call next with 401 error when authorization header is missing", () => {
      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "No token provided",
        }),
      );
    });

    it("should call next with 401 error when authorization header is empty", () => {
      mockRequest.headers.authorization = "";

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "No token provided",
        }),
      );
    });

    it("should call next with 401 error when authorization header does not start with Bearer", () => {
      mockRequest.headers.authorization = "Basic sometoken";

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "No token provided",
        }),
      );
    });

    it("should call next with 401 error when token is empty after Bearer prefix", () => {
      mockRequest.headers.authorization = "Bearer ";

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "No token provided",
        }),
      );
    });
  });

  describe("when token verification fails", () => {
    it("should call next with 401 error when JWT verification throws", () => {
      mockRequest.headers.authorization = "Bearer invalid-token";
      mockVerifyJwt.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyJwt).toHaveBeenCalledWith("invalid-token");
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Invalid token",
        }),
      );
    });

    it("should preserve AppError instances from JWT verification", () => {
      mockRequest.headers.authorization = "Bearer expired-token";
      const customError = new AppError(
        StatusCodes.UNAUTHORIZED,
        "Token expired",
      );
      mockVerifyJwt.mockImplementation(() => {
        throw customError;
      });

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(customError);
    });
  });

  describe("when token is valid", () => {
    it("should set req.user and call next() for USER role", () => {
      mockRequest.headers.authorization = "Bearer valid-user-token";
      const mockDecoded = {
        userId: "user-123",
        role: "USER" as const,
      };
      mockVerifyJwt.mockReturnValue(mockDecoded);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyJwt).toHaveBeenCalledWith("valid-user-token");
      expect(mockRequest.user).toEqual({
        userId: "user-123",
        role: "USER",
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should set req.user and call next() for ADMIN role", () => {
      mockRequest.headers.authorization = "Bearer valid-admin-token";
      const mockDecoded = {
        userId: "admin-456",
        role: "ADMIN" as const,
      };
      mockVerifyJwt.mockReturnValue(mockDecoded);

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyJwt).toHaveBeenCalledWith("valid-admin-token");
      expect(mockRequest.user).toEqual({
        userId: "admin-456",
        role: "ADMIN",
      });
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("token extraction", () => {
    it("should correctly extract token from Bearer authorization header", () => {
      mockRequest.headers.authorization =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      mockVerifyJwt.mockReturnValue({
        userId: "test-user",
        role: "USER",
      });

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyJwt).toHaveBeenCalledWith(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      );
    });
  });
});
