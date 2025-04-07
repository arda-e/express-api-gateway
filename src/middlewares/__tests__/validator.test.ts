import { Request, Response, NextFunction } from "express";
import { IsString, MinLength } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { Expose } from "class-transformer";
import { ResponseBuilder } from "@utils/ResponseBuilder";

import validateRequest from "../validator";

// Mock the ResponseBuilder
jest.mock("@utils/ResponseBuilder", () => {
  const mockBuild = jest.fn().mockReturnValue({ status: "error", errors: [] });
  return {
    ResponseBuilder: jest.fn().mockImplementation(() => ({
      setStatus: jest.fn().mockReturnThis(),
      setStatusCode: jest.fn().mockReturnThis(),
      setMessage: jest.fn().mockReturnThis(),
      setErrors: jest.fn().mockReturnThis(),
      build: mockBuild,
    })),
  };
});

// Create a test DTO class for validation
class TestDTO {
  @IsString()
  @MinLength(3)
  @Expose()
  name!: string;
}

describe("validateRequest middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    nextFunction = jest.fn();
  });

  it("should call next() when validation passes", async () => {
    // Arrange
    mockRequest.body = { name: "John Doe" };
    const middleware = validateRequest(TestDTO);

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("should transform the request body into the DTO instance", async () => {
    // Arrange
    mockRequest.body = { name: "John Doe", extraField: "should be removed" };
    const middleware = validateRequest(TestDTO);

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockRequest.body).toBeInstanceOf(TestDTO);
    expect(mockRequest.body.name).toBe("John Doe");
    // Extra field should be removed due to class transformation
    expect((mockRequest.body as any).extraField).toBeUndefined();
  });

  it("should return validation errors when validation fails", async () => {
    // Arrange
    mockRequest.body = { name: "ab" }; // Too short name
    const middleware = validateRequest(TestDTO);

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalled();

    // Verify that ResponseBuilder was called with correct parameters
    expect(ResponseBuilder).toHaveBeenCalled();
    const builderInstance = (ResponseBuilder as jest.Mock).mock.results[0].value;
    expect(builderInstance.setStatus).toHaveBeenCalledWith("error");
    expect(builderInstance.setStatusCode).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(builderInstance.setMessage).toHaveBeenCalledWith("Validation failed");
    expect(builderInstance.setErrors).toHaveBeenCalled();
    expect(builderInstance.build).toHaveBeenCalled();
  });

  it("should return validation errors when required field is missing", async () => {
    // Arrange
    mockRequest.body = {}; // Missing required name field
    const middleware = validateRequest(TestDTO);

    // Act
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalled();
  });
});
