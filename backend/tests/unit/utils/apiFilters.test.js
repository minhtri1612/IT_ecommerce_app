import { jest } from "@jest/globals";
import APIFilters from "../../../utils/apiFilters.js";

describe("APIFilters", () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = {
      find: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
    };
  });

  describe("constructor", () => {
    it("should initialize with query and queryStr", () => {
      const queryStr = { keyword: "test" };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      expect(apiFilters.query).toBe(mockQuery);
      expect(apiFilters.queryStr).toBe(queryStr);
    });
  });

  describe("search", () => {
    it("should search by keyword with regex", () => {
      const queryStr = { keyword: "laptop" };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      const result = apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: "laptop", $options: "i" },
      });
      expect(result).toBe(apiFilters);
    });

    it("should return empty search when no keyword", () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      const result = apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({});
      expect(result).toBe(apiFilters);
    });

    it("should be case insensitive", () => {
      const queryStr = { keyword: "LAPTOP" };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: "LAPTOP", $options: "i" },
      });
    });
  });

  describe("filters", () => {
    it("should remove keyword and page from query", () => {
      const queryStr = { keyword: "test", page: 1, category: "Electronics" };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({ category: "Electronics" });
    });

    it("should convert gt, gte, lt, lte to MongoDB operators", () => {
      const queryStr = { price: { gte: 100, lte: 500 } };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({
        price: { $gte: 100, $lte: 500 },
      });
    });

    it("should handle greater than operator", () => {
      const queryStr = { price: { gt: 50 } };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({
        price: { $gt: 50 },
      });
    });

    it("should handle less than operator", () => {
      const queryStr = { price: { lt: 1000 } };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({
        price: { $lt: 1000 },
      });
    });

    it("should handle ratings filter", () => {
      const queryStr = { ratings: { gte: 4 } };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({
        ratings: { $gte: 4 },
      });
    });

    it("should handle category filter", () => {
      const queryStr = { category: "Laptops" };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({ category: "Laptops" });
    });

    it("should return self for chaining", () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      const result = apiFilters.filters();

      expect(result).toBe(apiFilters);
    });
  });

  describe("pagination", () => {
    it("should set default page to 1", () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it("should calculate skip correctly for page 2", () => {
      const queryStr = { page: 2 };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
    });

    it("should calculate skip correctly for page 3", () => {
      const queryStr = { page: 3 };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(10);

      expect(mockQuery.skip).toHaveBeenCalledWith(20);
    });

    it("should handle different results per page", () => {
      const queryStr = { page: 2 };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(5);

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(mockQuery.skip).toHaveBeenCalledWith(5);
    });

    it("should convert page string to number", () => {
      const queryStr = { page: "3" };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(4);

      expect(mockQuery.skip).toHaveBeenCalledWith(8);
    });

    it("should return self for chaining", () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      const result = apiFilters.pagination(10);

      expect(result).toBe(apiFilters);
    });
  });

  describe("method chaining", () => {
    it("should support chaining search, filters, and pagination", () => {
      const queryStr = { keyword: "laptop", category: "Electronics", page: 2 };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      const result = apiFilters.search().filters().pagination(10);

      expect(result).toBe(apiFilters);
      expect(mockQuery.find).toHaveBeenCalledTimes(2);
      expect(mockQuery.limit).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalled();
    });
  });
});
