import { jest } from "@jest/globals";
import { mockRequest, mockResponse, mockNext } from "../../setup.js";

// Test exports and simple operations
// Complex database operations are tested in integration tests

describe("Product Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
  });

  describe("Controller exports", () => {
    it("should export getProducts function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.getProducts).toBeDefined();
      expect(typeof module.getProducts).toBe("function");
    });

    it("should export newProduct function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.newProduct).toBeDefined();
      expect(typeof module.newProduct).toBe("function");
    });

    it("should export getProductDetails function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.getProductDetails).toBeDefined();
      expect(typeof module.getProductDetails).toBe("function");
    });

    it("should export updateProduct function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.updateProduct).toBeDefined();
      expect(typeof module.updateProduct).toBe("function");
    });

    it("should export deleteProduct function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.deleteProduct).toBeDefined();
      expect(typeof module.deleteProduct).toBe("function");
    });

    it("should export getAdminProducts function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.getAdminProducts).toBeDefined();
      expect(typeof module.getAdminProducts).toBe("function");
    });

    it("should export createProductReview function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.createProductReview).toBeDefined();
      expect(typeof module.createProductReview).toBe("function");
    });

    it("should export getProductReviews function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.getProductReviews).toBeDefined();
      expect(typeof module.getProductReviews).toBe("function");
    });

    it("should export deleteReview function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.deleteReview).toBeDefined();
      expect(typeof module.deleteReview).toBe("function");
    });

    it("should export canUserReview function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.canUserReview).toBeDefined();
      expect(typeof module.canUserReview).toBe("function");
    });

    it("should export uploadProductImages function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.uploadProductImages).toBeDefined();
      expect(typeof module.uploadProductImages).toBe("function");
    });

    it("should export deleteProductImage function", async () => {
      const module = await import("../../../controllers/productControllers.js");
      expect(module.deleteProductImage).toBeDefined();
      expect(typeof module.deleteProductImage).toBe("function");
    });
  });

  describe("Controller count", () => {
    it("should export exactly 12 product controller functions", async () => {
      const module = await import("../../../controllers/productControllers.js");
      const exportedFunctions = Object.keys(module).filter(
        key => typeof module[key] === "function"
      );
      expect(exportedFunctions.length).toBe(12);
    });
  });
});
