import errorMiddleware from "../../../middlewares/errors.js";
import ErrorHandler from "../../../utils/errorHandler.js";
import { mockRequest, mockResponse, mockNext } from "../../setup.js";

describe("Error Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    process.env.NODE_ENV = "PRODUCTION";
  });

  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  describe("Default Error Handling", () => {
    it("should set default status code 500 for unknown errors", () => {
      const err = new Error("Something went wrong");

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should use error statusCode if provided", () => {
      const err = new ErrorHandler("Not found", 404);

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return error message in response", () => {
      const err = new ErrorHandler("Custom error message", 400);

      errorMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: "Custom error message",
      });
    });
  });

  describe("Mongoose CastError Handling", () => {
    it("should handle CastError (invalid MongoDB ID)", () => {
      const err = new Error("Cast to ObjectId failed");
      err.name = "CastError";
      err.path = "_id";

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Resource not found. Invalid: _id",
      });
    });
  });

  describe("Mongoose ValidationError Handling", () => {
    it("should handle ValidationError", () => {
      const err = new Error("Validation failed");
      err.name = "ValidationError";
      err.errors = {
        name: { message: "Name is required" },
        email: { message: "Email is invalid" },
      };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Mongoose Duplicate Key Error Handling", () => {
    it("should handle duplicate key error (code 11000)", () => {
      const err = new Error("Duplicate key");
      err.code = 11000;
      err.keyValue = { email: "test@example.com" };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Duplicate email entered.",
      });
    });
  });

  describe("JWT Error Handling", () => {
    it("should handle JsonWebTokenError", () => {
      const err = new Error("jwt malformed");
      err.name = "JsonWebTokenError";

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "JSON Web Token is invalid. Try Again!!!",
      });
    });

    it("should handle TokenExpiredError", () => {
      const err = new Error("jwt expired");
      err.name = "TokenExpiredError";

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "JSON Web Token is expired. Try Again!!!",
      });
    });
  });

  describe("Development vs Production Mode", () => {
    it("should include stack trace in development mode", () => {
      process.env.NODE_ENV = "DEVELOPMENT";
      const err = new Error("Dev error");
      err.stack = "Error stack trace";

      errorMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        stack: "Error stack trace",
      }));
    });

    it("should not include stack trace in production mode", () => {
      process.env.NODE_ENV = "PRODUCTION";
      const err = new Error("Prod error");
      err.stack = "Error stack trace";

      errorMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: "Prod error",
      });
    });
  });
});
