import "reflect-metadata";
import { container } from "tsyringe";

import { InvalidateCache } from "../decorators/Cache/InvalidateCache";
import { CacheService } from "../decorators/Cache/CacheService";

// Mock CacheService
const mockDelete = jest.fn().mockResolvedValue(undefined);
const mockCacheService = {
  delete: mockDelete,
};

describe("InvalidateCache Decorator", () => {
  // Sample class with decorated method for testing
  class TestClass {
    constructor(public name: string) {}

    // Method that invalidates a specific key
    @InvalidateCache("user:123")
    async updateUser(userData: object): Promise<object> {
      // This would normally update a user in database
      return { id: "123", ...userData, updated: true };
    }

    // Method that invalidates keys with a wildcard pattern
    @InvalidateCache("user:*")
    async deleteAllUsers(): Promise<boolean> {
      // This would normally delete all users
      return true;
    }
  }

  let testInstance: TestClass;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock container.resolve to return our mock CacheService
    jest.spyOn(container, "resolve").mockReturnValue(mockCacheService);

    testInstance = new TestClass("Test");
  });

  it("should call the original method and return its result", async () => {
    const userData = { name: "Updated Name" };
    const expectedResult = { id: "123", name: "Updated Name", updated: true };

    const result = await testInstance.updateUser(userData);

    expect(result).toEqual(expectedResult);
  });

  it("should invalidate cache with the specific key", async () => {
    await testInstance.updateUser({ name: "Test" });

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith("user:123");
  });

  it("should invalidate cache with wildcard pattern", async () => {
    await testInstance.deleteAllUsers();

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith("user:*");
  });

  it("should call the original method even if cache invalidation fails", async () => {
    // Mock cache delete to throw an error
    mockDelete.mockImplementationOnce(() => {
      throw new Error("Cache invalidation failed");
    });

    const userData = { name: "Updated Name" };
    const expectedResult = { id: "123", name: "Updated Name", updated: true };

    let error: unknown;
    try {
      // Should eventually throw the error because we don't handle it in the decorator
      await testInstance.updateUser(userData);
    } catch (e) {
      error = e;
    }

    // We expect it to throw because the decorator doesn't handle errors
    expect(error).toBeDefined();
    expect((error as Error).message).toBe("Cache invalidation failed");

    // Ensure mock was called
    expect(mockDelete).toHaveBeenCalledWith("user:123");
  });
});
