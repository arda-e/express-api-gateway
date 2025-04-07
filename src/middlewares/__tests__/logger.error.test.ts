import { Request, Response, NextFunction } from "express";
import Logger from "@utils/Logger";

import loggerMiddleware from "../logger";

// Mock the Logger module
jest.mock("@utils/Logger", () => {
  return {
    getLogger: jest.fn().mockReturnValue({
      info: jest.fn().mockImplementation(() => {
        throw new Error("Logger error");
      }),
    }),
  };
});

describe("logger middleware error handling", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: "GET",
      url: "/test-url",
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it("should pass errors to next() if logging fails", () => {
    // Act
    loggerMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    const error = nextFunction.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Logger error");
  });
});
