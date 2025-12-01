import { jest } from "@jest/globals";
import { isAuthenticatedUser, authorizeRoles } from "../../../middlewares/auth.js";
import ErrorHandler from "../../../utils/errorHandler.js";
import { mockRequest, mockResponse, mockNext } from "../../setup.js";

// Note: Complex token validation is tested in integration tests
// These unit tests focus on the authorizeRoles middleware and exports

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("isAuthenticatedUser", () => {
    it("should be exported as a function", () => {
      expect(isAuthenticatedUser).toBeDefined();
      expect(typeof isAuthenticatedUser).toBe("function");
    });

    it("should return error when no token is provided", async () => {
      req.cookies = {};

      await isAuthenticatedUser(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Login first to access this resource");
      expect(error.statusCode).toBe(401);
    });

    it("should return error when token is undefined", async () => {
      req.cookies = { token: undefined };

      await isAuthenticatedUser(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it("should return error when cookies object is empty", async () => {
      req.cookies = {};

      await isAuthenticatedUser(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe("Login first to access this resource");
    });
  });

  describe("authorizeRoles", () => {
    it("should be exported as a function", () => {
      expect(authorizeRoles).toBeDefined();
      expect(typeof authorizeRoles).toBe("function");
    });

    it("should return a middleware function", () => {
      const middleware = authorizeRoles("admin");
      expect(typeof middleware).toBe("function");
    });

    it("should call next() when user has authorized role", () => {
      req.user = { _id: "userId123", role: "admin" };

      const middleware = authorizeRoles("admin");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next() when user role is in the allowed roles list", () => {
      req.user = { _id: "userId123", role: "user" };

      const middleware = authorizeRoles("user", "admin");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it("should return error when user role is not authorized", () => {
      req.user = { _id: "userId123", role: "user" };

      const middleware = authorizeRoles("admin");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ErrorHandler);
      expect(error.message).toBe("Role (user) is not allowed to access this resource");
      expect(error.statusCode).toBe(403);
    });

    it("should return error when user role is not in multiple allowed roles", () => {
      req.user = { _id: "userId123", role: "guest" };

      const middleware = authorizeRoles("user", "admin");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it("should handle multiple roles correctly", () => {
      req.user = { _id: "userId123", role: "moderator" };

      const middleware = authorizeRoles("admin", "moderator", "superuser");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it("should work with single role", () => {
      req.user = { role: "user" };

      const middleware = authorizeRoles("user");
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should reject unauthorized roles", () => {
      req.user = { role: "subscriber" };

      const middleware = authorizeRoles("admin");
      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain("subscriber");
      expect(error.statusCode).toBe(403);
    });
  });
});
