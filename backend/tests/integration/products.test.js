import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import Product from "../../models/product.js";
import User from "../../models/user.js";
import { setupTestDB, teardownTestDB, clearDatabase } from "../setup.js";
import { testProduct, testProducts, testUser, testAdmin } from "../fixtures/testData.js";

describe("Products Integration Tests", () => {
  let app;
  let userId;
  let adminId;

  beforeAll(async () => {
    await setupTestDB();
    
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    
    // GET /api/v1/products - Get all products with filters
    app.get("/api/v1/products", async (req, res) => {
      try {
        const resPerPage = 4;
        let query = {};
        
        // Search by keyword
        if (req.query.keyword) {
          query.name = { $regex: req.query.keyword, $options: "i" };
        }
        
        // Filter by category
        if (req.query.category) {
          query.category = req.query.category;
        }
        
        // Filter by price
        if (req.query["price[gte]"]) {
          query.price = { ...query.price, $gte: Number(req.query["price[gte]"]) };
        }
        if (req.query["price[lte]"]) {
          query.price = { ...query.price, $lte: Number(req.query["price[lte]"]) };
        }
        
        const products = await Product.find(query);
        const filteredProductsCount = products.length;
        
        const page = Number(req.query.page) || 1;
        const skip = resPerPage * (page - 1);
        
        const paginatedProducts = await Product.find(query)
          .limit(resPerPage)
          .skip(skip);
        
        res.status(200).json({
          resPerPage,
          filteredProductsCount,
          products: paginatedProducts,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    
    // GET /api/v1/products/:id - Get product details
    app.get("/api/v1/products/:id", async (req, res) => {
      try {
        const product = await Product.findById(req.params.id).populate("reviews.user");
        
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({ product });
      } catch (error) {
        if (error.name === "CastError") {
          return res.status(404).json({ message: "Product not found" });
        }
        res.status(500).json({ message: error.message });
      }
    });
    
    // POST /api/v1/admin/products - Create new product
    app.post("/api/v1/admin/products", async (req, res) => {
      try {
        req.body.user = userId;
        const product = await Product.create(req.body);
        res.status(201).json({ product });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
    
    // PUT /api/v1/products/:id - Update product
    app.put("/api/v1/products/:id", async (req, res) => {
      try {
        let product = await Product.findById(req.params.id);
        
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
        });
        
        res.status(200).json({ product });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    
    // DELETE /api/v1/products/:id - Delete product
    app.delete("/api/v1/products/:id", async (req, res) => {
      try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        await product.deleteOne();
        res.status(200).json({ message: "Product Deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create(testUser);
    userId = user._id;
    
    const admin = await User.create(testAdmin);
    adminId = admin._id;
  });

  describe("GET /api/v1/products", () => {
    beforeEach(async () => {
      // Create test products
      for (const product of testProducts) {
        await Product.create({ ...product, user: userId });
      }
    });

    it("should return all products", async () => {
      const res = await request(app).get("/api/v1/products");

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.filteredProductsCount).toBe(testProducts.length);
    });

    it("should search products by keyword", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .query({ keyword: "laptop" });

      expect(res.statusCode).toBe(200);
      res.body.products.forEach((product) => {
        expect(product.name.toLowerCase()).toContain("laptop");
      });
    });

    it("should filter products by category", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .query({ category: "Laptops" });

      expect(res.statusCode).toBe(200);
      res.body.products.forEach((product) => {
        expect(product.category).toBe("Laptops");
      });
    });

    it("should paginate results", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .query({ page: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.resPerPage).toBe(4);
      expect(res.body.products.length).toBeLessThanOrEqual(4);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({ ...testProduct, user: userId });
      productId = product._id.toString();
    });

    it("should return product details", async () => {
      const res = await request(app).get(`/api/v1/products/${productId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.name).toBe(testProduct.name);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/api/v1/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Product not found");
    });

    it("should return 404 for invalid product id", async () => {
      const res = await request(app).get("/api/v1/products/invalid-id");

      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/admin/products", () => {
    it("should create a new product", async () => {
      const res = await request(app)
        .post("/api/v1/admin/products")
        .send(testProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.name).toBe(testProduct.name);
      expect(res.body.product.price).toBe(testProduct.price);
    });

    it("should return error for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/admin/products")
        .send({ name: "Incomplete Product" });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("PUT /api/v1/products/:id", () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({ ...testProduct, user: userId });
      productId = product._id.toString();
    });

    it("should update product", async () => {
      const updateData = { name: "Updated Product Name", price: 199.99 };

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.product.name).toBe("Updated Product Name");
      expect(res.body.product.price).toBe(199.99);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .put(`/api/v1/products/${fakeId}`)
        .send({ name: "Updated" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({ ...testProduct, user: userId });
      productId = product._id.toString();
    });

    it("should delete product", async () => {
      const res = await request(app).delete(`/api/v1/products/${productId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Product Deleted");

      // Verify product is deleted
      const deletedProduct = await Product.findById(productId);
      expect(deletedProduct).toBeNull();
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).delete(`/api/v1/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
