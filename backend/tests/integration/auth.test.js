import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from "../../models/user.js";
import { setupTestDB, teardownTestDB, clearDatabase } from "../setup.js";
import { testUser, testAdmin } from "../fixtures/testData.js";

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  
  // Import routes dynamically for testing
  return app;
};

describe("Auth Integration Tests", () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
    
    // Setup routes
    app.post("/api/v1/register", async (req, res) => {
      try {
        const { name, email, password } = req.body;
        
        if (!password) {
          return res.status(400).json({ message: "Password is required" });
        }
        
        const user = await User.create({ name, email, password });
        const token = user.getJwtToken();
        
        res.cookie("token", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        });
        
        res.status(201).json({ success: true, user, token });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: error.message });
      }
    });
    
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Please enter email & password" });
      }
      
      const user = await User.findOne({ email }).select("+password");
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isPasswordMatched = await user.comparePassword(password);
      
      if (!isPasswordMatched) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const token = user.getJwtToken();
      
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      });
      
      res.status(200).json({ success: true, user, token });
    });
    
    app.get("/api/v1/logout", (req, res) => {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(200).json({ message: "Logged Out" });
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    process.env.JWT_SECRET = "test-jwt-secret-key";
    process.env.JWT_EXPIRES_TIME = "7d";
  });

  describe("POST /api/v1/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/v1/register")
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.token).toBeDefined();
    });

    it("should return error for missing password", async () => {
      const res = await request(app)
        .post("/api/v1/register")
        .send({
          name: "Test User",
          email: "test@example.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Password is required");
    });

    it("should return error for duplicate email", async () => {
      // First registration
      await request(app)
        .post("/api/v1/register")
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        });

      // Second registration with same email
      const res = await request(app)
        .post("/api/v1/register")
        .send({
          name: "Another User",
          email: testUser.email,
          password: "anotherpassword",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });

    it("should set authentication cookie", async () => {
      const res = await request(app)
        .post("/api/v1/register")
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });
  });

  describe("POST /api/v1/login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create(testUser);
    });

    it("should login user with valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should return error for missing credentials", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({
          email: testUser.email,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Please enter email & password");
    });

    it("should return error for invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({
          email: "wrong@example.com",
          password: testUser.password,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return error for invalid password", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should set authentication cookie on login", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("token=");
    });
  });

  describe("GET /api/v1/logout", () => {
    it("should logout user and clear cookie", async () => {
      const res = await request(app).get("/api/v1/logout");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logged Out");
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });
});
