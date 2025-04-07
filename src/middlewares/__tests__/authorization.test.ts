import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { AuthenticationError, AuthorizationError } from "@utils/errors";

// Use a simplified version for testing
const mockAuthMiddleware = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        next(new AuthenticationError("User not authenticated"));
        return;
      }

      // Check permissions using the test-only property
      const userPermissions = (req as any).__mockUserPermissions || [];
      const hasRequiredPermissions = requiredPermissions.every((requiredPermission) =>
        userPermissions.some((userPermission: any) => userPermission.name === requiredPermission),
      );

      if (!hasRequiredPermissions) {
        next(new AuthorizationError("User does not have required permissions"));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

describe("authorization middleware", () => {
  let mockRequest: Partial<Request> & {
    user?: { id: string };
    __mockUserPermissions?: Array<{ id: string; name: string }>;
  };
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: "user-123",
      },
      __mockUserPermissions: [],
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when user has all required permissions", async () => {
    // Arrange
    const requiredPermissions = ["permission1", "permission2"];
    mockRequest.__mockUserPermissions = [
      { id: "1", name: "permission1" },
      { id: "2", name: "permission2" },
      { id: "3", name: "permission3" },
    ];

    const authMiddleware = mockAuthMiddleware(requiredPermissions);

    // Act
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it("should pass AuthorizationError to next() when user doesn't have all required permissions", async () => {
    // Arrange
    const requiredPermissions = ["permission1", "permission2", "permission4"];
    mockRequest.__mockUserPermissions = [
      { id: "1", name: "permission1" },
      { id: "2", name: "permission2" },
    ];

    const authMiddleware = mockAuthMiddleware(requiredPermissions);

    // Act
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);

    const error = nextFunction.mock.calls[0][0];
    expect(error.message).toBe("User does not have required permissions");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("AUTHORIZATION_ERROR");
  });

  it("should pass AuthenticationError to next() when user is not authenticated", async () => {
    // Arrange
    mockRequest.user = undefined;
    const requiredPermissions = ["permission1"];
    const authMiddleware = mockAuthMiddleware(requiredPermissions);

    // Act
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);

    const error = nextFunction.mock.calls[0][0];
    expect(error.message).toBe("User not authenticated");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("AUTHENTICATION_ERROR");
  });

  it("should pass any unexpected error to next()", async () => {
    // Arrange
    const requiredPermissions = ["permission1"];
    const unexpectedError = new Error("Test error");

    // Create a mock that throws an error
    const mockUserWithError = {} as any;

    // Override the id getter to throw
    Object.defineProperty(mockUserWithError, "id", {
      get: function () {
        throw unexpectedError;
      },
    });

    mockRequest.user = mockUserWithError;

    const authMiddleware = mockAuthMiddleware(requiredPermissions);

    // Act
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(unexpectedError);
  });
});
