import { jest } from "@jest/globals";
import { mockRequest, mockResponse, mockNext } from "../../setup.js";

// We'll test the logout function directly as it doesn't require database mocking
// and test other functions through integration tests

describe("Auth Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
  });

  describe("logout", () => {
    it("should be exported from authControllers", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.logout).toBeDefined();
      expect(typeof authModule.logout).toBe("function");
    });

    it("should logout user and clear cookie", async () => {
      const { logout } = await import("../../../controllers/authControllers.js");
      
      await logout(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith("token", null, expect.objectContaining({
        httpOnly: true,
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged Out" });
    });

    it("should set expires to current date", async () => {
      const { logout } = await import("../../../controllers/authControllers.js");
      
      await logout(req, res, next);

      const cookieCall = res.cookie.mock.calls[0];
      expect(cookieCall[2].expires).toBeInstanceOf(Date);
    });
  });

  describe("Controller exports", () => {
    it("should export registerUser function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.registerUser).toBeDefined();
      expect(typeof authModule.registerUser).toBe("function");
    });

    it("should export loginUser function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.loginUser).toBeDefined();
      expect(typeof authModule.loginUser).toBe("function");
    });

    it("should export getUserProfile function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.getUserProfile).toBeDefined();
      expect(typeof authModule.getUserProfile).toBe("function");
    });

    it("should export updateProfile function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.updateProfile).toBeDefined();
      expect(typeof authModule.updateProfile).toBe("function");
    });

    it("should export updatePassword function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.updatePassword).toBeDefined();
      expect(typeof authModule.updatePassword).toBe("function");
    });

    it("should export forgotPassword function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.forgotPassword).toBeDefined();
      expect(typeof authModule.forgotPassword).toBe("function");
    });

    it("should export resetPassword function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.resetPassword).toBeDefined();
      expect(typeof authModule.resetPassword).toBe("function");
    });

    it("should export allUsers function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.allUsers).toBeDefined();
      expect(typeof authModule.allUsers).toBe("function");
    });

    it("should export getUserDetails function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.getUserDetails).toBeDefined();
      expect(typeof authModule.getUserDetails).toBe("function");
    });

    it("should export updateUser function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.updateUser).toBeDefined();
      expect(typeof authModule.updateUser).toBe("function");
    });

    it("should export deleteUser function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.deleteUser).toBeDefined();
      expect(typeof authModule.deleteUser).toBe("function");
    });

    it("should export uploadAvatar function", async () => {
      const authModule = await import("../../../controllers/authControllers.js");
      expect(authModule.uploadAvatar).toBeDefined();
      expect(typeof authModule.uploadAvatar).toBe("function");
    });
  });
});
