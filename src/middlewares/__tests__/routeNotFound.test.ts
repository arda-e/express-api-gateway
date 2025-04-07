import { Request, Response } from "express";
import { RouteNotFoundError } from "@utils/errors";

import routeNotFound from "../routeNotFound";

describe("routeNotFound middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      originalUrl: "/unknown-route",
    };

    mockResponse = {
      status: statusMock,
    };
  });

  it("should set status to 404 and return an error message with the original URL", () => {
    // Act
    routeNotFound(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "🔍 - Not Found - /unknown-route",
    });
  });

  it("should work with different URLs", () => {
    // Arrange
    const testUrls = ["/api/users", "/api/products/123", "/invalid-path"];

    testUrls.forEach((url) => {
      // Setup request for this test case
      mockRequest.originalUrl = url;

      // Reset mocks
      statusMock.mockClear();
      jsonMock.mockClear();

      // Act
      routeNotFound(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: `🔍 - Not Found - ${url}`,
      });
    });
  });
});
