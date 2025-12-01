import mongoose from "mongoose";
import { jest } from "@jest/globals";

let mongoServer;

// Setup before all tests
export const setupTestDB = async () => {
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.warn("MongoMemoryServer not available, skipping DB setup");
  }
};

// Cleanup after all tests
export const teardownTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.warn("Error during teardown:", error.message);
  }
};

// Clear all collections
export const clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.warn("Error clearing database:", error.message);
  }
};

// Mock request object
export const mockRequest = (options = {}) => ({
  body: options.body || {},
  params: options.params || {},
  query: options.query || {},
  user: options.user || null,
  cookies: options.cookies || {},
  ...options,
});

// Mock response object
export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function - returns a new mock function each time
export const mockNext = () => jest.fn();

export default {
  setupTestDB,
  teardownTestDB,
  clearDatabase,
  mockRequest,
  mockResponse,
  mockNext,
};