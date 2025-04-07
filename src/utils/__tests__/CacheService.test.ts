import "reflect-metadata";
import { container } from "tsyringe";

import { CacheService } from "../decorators/Cache/CacheService";
import { RedisManager } from "../RedisManager";

// Mock Redis client methods
const mockRedisGet = jest.fn();
const mockRedisSet = jest.fn();
const mockRedisDel = jest.fn();
const mockRedisKeys = jest.fn();
const mockRedisFlushAll = jest.fn();
const mockRedisQuit = jest.fn();

// Mock Redis client
const mockRedisClient = {
  get: mockRedisGet,
  set: mockRedisSet,
  del: mockRedisDel,
  keys: mockRedisKeys,
  flushAll: mockRedisFlushAll,
  quit: mockRedisQuit,
};

// Mock RedisManager
const mockGetRedisClient = jest.fn().mockReturnValue(mockRedisClient);
const mockRedisManager = {
  getRedisClient: mockGetRedisClient,
};

describe("CacheService", () => {
  let cacheService: CacheService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up container mock for RedisManager
    jest.spyOn(container, "resolve").mockReturnValue(mockRedisManager);

    // Create a new instance of CacheService for each test
    cacheService = new CacheService();
  });

  describe("get", () => {
    it("should call redis.get with the provided key", async () => {
      const key = "test-key";
      const expectedValue = "test-value";

      mockRedisGet.mockResolvedValue(expectedValue);

      const result = await cacheService.get(key);

      expect(mockRedisGet).toHaveBeenCalledTimes(1);
      expect(mockRedisGet).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it("should return null when the key does not exist", async () => {
      const key = "non-existent-key";

      mockRedisGet.mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(mockRedisGet).toHaveBeenCalledTimes(1);
      expect(mockRedisGet).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should call redis.set with key and value when ttl is not provided", async () => {
      const key = "test-key";
      const value = "test-value";

      await cacheService.set(key, value);

      expect(mockRedisSet).toHaveBeenCalledTimes(1);
      expect(mockRedisSet).toHaveBeenCalledWith(key, value);
    });

    it("should call redis.set with key, value and TTL options when ttl is provided", async () => {
      const key = "test-key";
      const value = "test-value";
      const ttl = 60000; // 60 seconds

      await cacheService.set(key, value, ttl);

      expect(mockRedisSet).toHaveBeenCalledTimes(1);
      expect(mockRedisSet).toHaveBeenCalledWith(key, value, { EX: ttl });
    });
  });

  describe("delete", () => {
    it("should call redis.del with the provided key when no wildcard is present", async () => {
      const key = "test-key";

      await cacheService.delete(key);

      expect(mockRedisDel).toHaveBeenCalledTimes(1);
      expect(mockRedisDel).toHaveBeenCalledWith(key);
      expect(mockRedisKeys).not.toHaveBeenCalled();
    });

    it("should use keys and del when a wildcard is present", async () => {
      const wildcardKey = "test-*";
      const matchingKeys = ["test-1", "test-2", "test-3"];

      mockRedisKeys.mockResolvedValue(matchingKeys);

      await cacheService.delete(wildcardKey);

      expect(mockRedisKeys).toHaveBeenCalledTimes(1);
      expect(mockRedisKeys).toHaveBeenCalledWith(wildcardKey);
      expect(mockRedisDel).toHaveBeenCalledTimes(1);
      expect(mockRedisDel).toHaveBeenCalledWith(matchingKeys);
    });

    it("should not call redis.del when a wildcard is present but no keys match", async () => {
      const wildcardKey = "test-*";

      mockRedisKeys.mockResolvedValue([]);

      await cacheService.delete(wildcardKey);

      expect(mockRedisKeys).toHaveBeenCalledTimes(1);
      expect(mockRedisKeys).toHaveBeenCalledWith(wildcardKey);
      expect(mockRedisDel).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("should call redis.flushAll", async () => {
      await cacheService.clear();

      expect(mockRedisFlushAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("close", () => {
    it("should call redis.quit", async () => {
      await cacheService.close();

      expect(mockRedisQuit).toHaveBeenCalledTimes(1);
    });
  });
});
