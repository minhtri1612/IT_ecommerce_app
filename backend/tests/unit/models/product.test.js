import mongoose from "mongoose";
import Product from "../../../models/product.js";
import User from "../../../models/user.js";
import { setupTestDB, teardownTestDB, clearDatabase } from "../../setup.js";
import { testProduct, testProducts, testUser } from "../../fixtures/testData.js";

describe("Product Model", () => {
  let userId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create(testUser);
    userId = user._id;
  });

  describe("Product Creation", () => {
    it("should create a product successfully with valid data", async () => {
      const productData = { ...testProduct, user: userId };
      const product = await Product.create(productData);
      
      expect(product._id).toBeDefined();
      expect(product.name).toBe(testProduct.name);
      expect(product.price).toBe(testProduct.price);
      expect(product.category).toBe(testProduct.category);
    });

    it("should set default ratings to 0", async () => {
      const productData = {
        name: "New Product",
        price: 50,
        description: "Test description",
        category: "Electronics",
        seller: "Test Seller",
        stock: 5,
        user: userId,
        images: [{ public_id: "test", url: "https://example.com/test.jpg" }],
      };
      
      const product = await Product.create(productData);
      
      expect(product.ratings).toBe(0);
    });

    it("should set default numOfReviews to 0", async () => {
      const productData = {
        name: "New Product",
        price: 50,
        description: "Test description",
        category: "Electronics",
        seller: "Test Seller",
        stock: 5,
        user: userId,
        images: [{ public_id: "test", url: "https://example.com/test.jpg" }],
      };
      
      const product = await Product.create(productData);
      
      expect(product.numOfReviews).toBe(0);
    });
  });

  describe("Product Validation", () => {
    it("should fail without name", async () => {
      const productData = { ...testProduct, user: userId };
      delete productData.name;
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail without price", async () => {
      const productData = { ...testProduct, user: userId };
      delete productData.price;
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail without description", async () => {
      const productData = { ...testProduct, user: userId };
      delete productData.description;
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail without category", async () => {
      const productData = { ...testProduct, user: userId };
      delete productData.category;
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail with invalid category", async () => {
      const productData = { ...testProduct, user: userId, category: "InvalidCategory" };
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail without seller", async () => {
      const productData = { ...testProduct, user: userId };
      delete productData.seller;
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail without stock", async () => {
      const productData = { ...testProduct, user: userId };
      delete productData.stock;
      
      await expect(Product.create(productData)).rejects.toThrow();
    });

    it("should fail with name exceeding 200 characters", async () => {
      const productData = { ...testProduct, user: userId, name: "a".repeat(201) };
      
      await expect(Product.create(productData)).rejects.toThrow();
    });
  });

  describe("Product Categories", () => {
    const validCategories = [
      "Electronics",
      "Cameras",
      "Laptops",
      "Accessories",
      "Headphones",
      "Food",
      "Books",
      "Sports",
      "Outdoor",
      "Home",
    ];

    validCategories.forEach((category) => {
      it(`should accept category: ${category}`, async () => {
        const productData = { ...testProduct, user: userId, category };
        const product = await Product.create(productData);
        
        expect(product.category).toBe(category);
      });
    });
  });

  describe("Product Reviews", () => {
    it("should add a review to product", async () => {
      const productData = { ...testProduct, user: userId };
      const product = await Product.create(productData);
      
      product.reviews.push({
        user: userId,
        rating: 5,
        comment: "Great product!",
      });
      
      await product.save();
      
      expect(product.reviews.length).toBe(1);
      expect(product.reviews[0].rating).toBe(5);
    });

    it("should store multiple reviews", async () => {
      const productData = { ...testProduct, user: userId };
      const product = await Product.create(productData);
      
      const user2 = await User.create({
        name: "User 2",
        email: "user2@example.com",
        password: "password123",
      });
      
      product.reviews.push(
        { user: userId, rating: 5, comment: "Excellent!" },
        { user: user2._id, rating: 4, comment: "Good product" }
      );
      
      await product.save();
      
      expect(product.reviews.length).toBe(2);
    });
  });

  describe("Product Images", () => {
    it("should store multiple images", async () => {
      const productData = {
        ...testProduct,
        user: userId,
        images: [
          { public_id: "img1", url: "https://example.com/img1.jpg" },
          { public_id: "img2", url: "https://example.com/img2.jpg" },
        ],
      };
      
      const product = await Product.create(productData);
      
      expect(product.images.length).toBe(2);
    });
  });
});
