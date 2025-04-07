import { Request, Response, NextFunction } from "express";
import session from "express-session";
import { AuthenticationError } from "@utils/errors";

import { authRequired } from "../authRequired";

// Extend the session interface to include our userId property
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

describe("authRequired middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      session: {} as session.Session & Partial<session.SessionData>,
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it("should call next() when userId exists in session", () => {
    // Arrange
    mockRequest.session = {
      userId: "user-123",
    } as session.Session & Partial<session.SessionData>;

    // Act
    authRequired(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it("should pass AuthenticationError to next() when userId doesn't exist in session", () => {
    // Act
    authRequired(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    const error = nextFunction.mock.calls[0][0];
    expect(error.message).toBe("Authentication required");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("AUTHENTICATION_ERROR");
  });

  it("should pass AuthenticationError to next() when session is undefined", () => {
    // Arrange
    mockRequest.session = undefined;

    // Act
    authRequired(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    const error = nextFunction.mock.calls[0][0];
    expect(error.message).toBe("Authentication required");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("AUTHENTICATION_ERROR");
  });

  it("should pass any error to next() if an unexpected error occurs", () => {
    // Arrange
    const unexpectedError = new Error("Unexpected error");

    // Create a mock session that throws when userId is accessed
    const mockSession = {
      get userId() {
        throw unexpectedError;
      },
    };

    mockRequest.session = mockSession as session.Session & Partial<session.SessionData>;

    // Act
    authRequired(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(unexpectedError);
  });
});
