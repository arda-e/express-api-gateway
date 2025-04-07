import { Request, Response } from "express";
import Logger from "@utils/Logger";

import loggerMiddleware from "../logger";

// Mock the Logger module
jest.mock("@utils/Logger", () => {
  const mockInfo = jest.fn();
  return {
    getLogger: jest.fn().mockReturnValue({
      info: mockInfo,
    }),
  };
});

describe("logger middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let mockLogger: { info: jest.Mock };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup request mock
    mockRequest = {
      method: "GET",
      url: "/test-url",
    };

    // Setup response mock
    mockResponse = {};

    // Setup next function mock
    nextFunction = jest.fn();

    // Get reference to the mock logger
    mockLogger = Logger.getLogger() as unknown as { info: jest.Mock };
  });

  it("should log the request method and URL", () => {
    // Act
    loggerMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith("GET /test-url");
  });

  it("should call next() function", () => {
    // Act
    loggerMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it("should work with different HTTP methods and URLs", () => {
    // Arrange
    const testCases = [
      { method: "POST", url: "/api/users" },
      { method: "PUT", url: "/api/products/123" },
      { method: "DELETE", url: "/api/comments/456" },
    ];

    testCases.forEach((testCase) => {
      // Setup request for this test case
      mockRequest.method = testCase.method;
      mockRequest.url = testCase.url;

      // Act
      loggerMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(`${testCase.method} ${testCase.url}`);
    });

    // Verify next was called for each test case
    expect(nextFunction).toHaveBeenCalledTimes(testCases.length);
  });
});
