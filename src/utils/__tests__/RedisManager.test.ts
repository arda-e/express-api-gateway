import "reflect-metadata";
import { createClient } from "redis";
import { setTimeout as sleep } from "timers/promises";

import { RedisManager } from "../RedisManager";

// Mock redis
jest.mock("redis", () => {
  const mockConnect = jest.fn();
  const mockQuit = jest.fn().mockResolvedValue(undefined);
  const mockOn = jest.fn();
  const mockClient = {
    connect: mockConnect,
    quit: mockQuit,
    on: mockOn,
  };
  return {
    createClient: jest.fn().mockReturnValue(mockClient),
  };
});

// Mock the logger
jest.mock("../Logger", () => ({
  __esModule: true,
  default: {
    getLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
    }),
  },
}));

describe("RedisManager", () => {
  let redisManager: RedisManager;
  const mockRedisClient = createClient() as any;

  beforeEach(() => {
    jest.clearAllMocks();
    redisManager = new RedisManager();
  });

  describe("initialize", () => {
    it("should initialize the Redis client", async () => {
      // Simulate successful connection
      mockRedisClient.on.mockImplementation((event: string, callback: () => void) => {
        if (event === "connect") {
          setTimeout(callback, 10);
        }
        return mockRedisClient;
      });

      await redisManager.initialize();

      expect(createClient).toHaveBeenCalledWith({
        url: "redis://redis:6379",
      });
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it("should throw an error after maximum retries", async () => {
      // Simulate connection failure
      mockRedisClient.on.mockImplementation((event: string, callback: (err?: Error) => void) => {
        if (event === "error") {
          setTimeout(() => callback(new Error("Connection refused")), 10);
        }
        return mockRedisClient;
      });

      await expect(redisManager.initialize()).rejects.toThrow(
        "Failed to connect to Redis after 5 attempts",
      );

      expect(mockRedisClient.connect).toHaveBeenCalledTimes(5);
    });

    it("should handle timeout", async () => {
      // Simulate timeout (connection neither succeeds nor fails)
      mockRedisClient.on.mockReturnValue(mockRedisClient);

      // Mock the connectWithTimeout method to immediately reject with a timeout error
      jest
        .spyOn(redisManager as any, "connectWithTimeout")
        .mockRejectedValue(new Error("Redis connection timed out after 5000 ms"));

      await expect(redisManager.initialize()).rejects.toThrow("Redis connection timed out");
    }, 10000); // Increase timeout for this test
  });

  describe("getRedisClient", () => {
    it("should return the Redis client", async () => {
      // Setup successful connection first
      mockRedisClient.on.mockImplementation((event: string, callback: () => void) => {
        if (event === "connect") {
          setTimeout(callback, 10);
        }
        return mockRedisClient;
      });

      await redisManager.initialize();
      const client = redisManager.getRedisClient();

      expect(client).toBeDefined();
    });
  });

  describe("close", () => {
    it("should close the Redis client connection", async () => {
      // Setup successful connection first
      mockRedisClient.on.mockImplementation((event: string, callback: () => void) => {
        if (event === "connect") {
          setTimeout(callback, 10);
        }
        return mockRedisClient;
      });

      await redisManager.initialize();
      await redisManager.close();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it("should do nothing if the client is not initialized", async () => {
      await redisManager.close();
      expect(mockRedisClient.quit).not.toHaveBeenCalled();
    });
  });
});

/**
 * Integration tests that require a real Redis connection.
 * These tests will be skipped if Redis is not available.
 */
describe("RedisManager Integration", () => {
  let realRedisManager: RedisManager;

  // Reset mocks to use the real implementations
  beforeAll(() => {
    jest.resetModules();
    jest.unmock("redis");
    jest.unmock("../Logger");
  });

  beforeEach(() => {
    realRedisManager = new RedisManager();
  });

  afterEach(async () => {
    try {
      await realRedisManager.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  // Helper function to check if Redis is available
  const isRedisAvailable = async (): Promise<boolean> => {
    try {
      const client = createClient({
        url: "redis://redis:6379",
      });
      await client.connect();
      await client.quit();
      return true;
    } catch (error) {
      return false;
    }
  };

  it("should connect to a real Redis server", async () => {
    const redisAvailable = await isRedisAvailable();

    if (!redisAvailable) {
      console.warn("Skipping test: Redis server is not available");
      return;
    }

    // Test actual connection
    await expect(realRedisManager.initialize()).resolves.not.toThrow();

    const redisClient = realRedisManager.getRedisClient();
    expect(redisClient).toBeDefined();

    // Close the connection
    await realRedisManager.close();
  });
});
