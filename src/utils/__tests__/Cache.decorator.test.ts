import "reflect-metadata";
import { container } from "tsyringe";

import { Cache, CACHE_SYMBOL } from "../decorators/Cache/Cache";
import { CacheService } from "../decorators/Cache/CacheService";

// Mock CacheService
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockCacheService = {
  get: mockGet,
  set: mockSet,
};

describe("Cache Decorator", () => {
  // Sample class with decorated method for testing
  class TestClass {
    constructor(public name: string) {}

    @Cache({ ttl: 1000 })
    async getData(id: string): Promise<{ id: string; data: string }> {
      // This would normally hit a database or external service
      return { id, data: `Data for ${this.name} with id ${id}` };
    }

    @Cache() // Default TTL
    async getSimpleData(): Promise<string> {
      return "Simple data";
    }
  }

  let testInstance: TestClass;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock container.resolve to return our mock CacheService
    jest.spyOn(container, "resolve").mockReturnValue(mockCacheService);

    testInstance = new TestClass("Test");
  });

  describe("Caching behavior", () => {
    it("should cache method result on first call", async () => {
      // Cache miss (first call)
      mockGet.mockResolvedValueOnce(null);

      const id = "123";
      const expectedResult = { id, data: `Data for Test with id ${id}` };

      const result = await testInstance.getData(id);

      // Verify the original method was executed
      expect(result).toEqual(expectedResult);

      // Verify cache interactions
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("getData"));
      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(
        expect.stringContaining("getData"),
        expectedResult,
        1000,
      );
    });

    it("should return cached result on subsequent calls", async () => {
      const id = "123";
      const cachedResult = { id, data: "Cached data" };

      // Cache hit (subsequent call)
      mockGet.mockResolvedValueOnce(cachedResult);

      const result = await testInstance.getData(id);

      // Verify the cached result was returned
      expect(result).toEqual(cachedResult);

      // Verify cache interactions
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockSet).not.toHaveBeenCalled(); // Should not set cache on a hit
    });

    it("should use default TTL when none specified", async () => {
      // Cache miss
      mockGet.mockResolvedValueOnce(null);

      await testInstance.getSimpleData();

      // Verify default TTL is used
      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(
        expect.stringContaining("getSimpleData"),
        "Simple data",
        5000, // Default TTL is 5000ms
      );
    });
  });

  describe("Error handling", () => {
    it("should continue execution if cache get fails", async () => {
      // Mock cache get error
      mockGet.mockRejectedValueOnce(new Error("Cache get error"));

      const id = "123";
      const expectedResult = { id, data: `Data for Test with id ${id}` };

      const result = await testInstance.getData(id);

      // Should still return the original method result
      expect(result).toEqual(expectedResult);

      // Should attempt to set the cache despite get error
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should return method result if cache set fails", async () => {
      // Cache miss
      mockGet.mockResolvedValueOnce(null);

      // Mock cache set error
      mockSet.mockRejectedValueOnce(new Error("Cache set error"));

      const id = "123";
      const expectedResult = { id, data: `Data for Test with id ${id}` };

      const result = await testInstance.getData(id);

      // Should still return the original method result
      expect(result).toEqual(expectedResult);
    });
  });
});
