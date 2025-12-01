import mongoose from "mongoose";
import User from "../../../models/user.js";
import { setupTestDB, teardownTestDB, clearDatabase } from "../../setup.js";
import { testUser, testAdmin } from "../../fixtures/testData.js";

describe("User Model", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("User Creation", () => {
    it("should create a user successfully with valid data", async () => {
      const user = await User.create(testUser);
      
      expect(user._id).toBeDefined();
      expect(user.name).toBe(testUser.name);
      expect(user.email).toBe(testUser.email);
      expect(user.role).toBe("user");
    });

    it("should hash the password before saving", async () => {
      const user = await User.create(testUser);
      
      expect(user.password).not.toBe(testUser.password);
      expect(user.password.length).toBeGreaterThan(testUser.password.length);
    });

    it("should set default role to user", async () => {
      const userData = { ...testUser };
      delete userData.role;
      
      const user = await User.create(userData);
      
      expect(user.role).toBe("user");
    });

    it("should create admin user with admin role", async () => {
      const user = await User.create(testAdmin);
      
      expect(user.role).toBe("admin");
    });
  });

  describe("User Validation", () => {
    it("should fail without name", async () => {
      const userData = { ...testUser };
      delete userData.name;
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail without email", async () => {
      const userData = { ...testUser };
      delete userData.email;
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail without password", async () => {
      const userData = { ...testUser };
      delete userData.password;
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail with password less than 6 characters", async () => {
      const userData = { ...testUser, password: "12345" };
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail with duplicate email", async () => {
      await User.create(testUser);
      
      await expect(User.create(testUser)).rejects.toThrow();
    });

    it("should fail with name exceeding 50 characters", async () => {
      const userData = { ...testUser, name: "a".repeat(51) };
      
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe("User Methods", () => {
    it("should compare password correctly", async () => {
      const user = await User.create(testUser);
      const userWithPassword = await User.findById(user._id).select("+password");
      
      const isMatch = await userWithPassword.comparePassword(testUser.password);
      expect(isMatch).toBe(true);
    });

    it("should return false for wrong password", async () => {
      const user = await User.create(testUser);
      const userWithPassword = await User.findById(user._id).select("+password");
      
      const isMatch = await userWithPassword.comparePassword("wrongpassword");
      expect(isMatch).toBe(false);
    });

    it("should generate JWT token", async () => {
      process.env.JWT_SECRET = "test_secret";
      process.env.JWT_EXPIRES_TIME = "7d";
      
      const user = await User.create(testUser);
      const token = user.getJwtToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should generate reset password token", async () => {
      const user = await User.create(testUser);
      const resetToken = user.getResetPasswordToken();
      
      expect(resetToken).toBeDefined();
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
    });
  });

  describe("Password not returned by default", () => {
    it("should not return password by default", async () => {
      await User.create(testUser);
      const user = await User.findOne({ email: testUser.email });
      
      expect(user.password).toBeUndefined();
    });

    it("should return password when explicitly selected", async () => {
      await User.create(testUser);
      const user = await User.findOne({ email: testUser.email }).select("+password");
      
      expect(user.password).toBeDefined();
    });
  });
});
