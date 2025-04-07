import { ApiResponse } from "../Response";
import { ResponseBuilder } from "../ResponseBuilder";

describe("ApiResponse", () => {
  describe("success", () => {
    it("should create a success response with default values", () => {
      const response = ApiResponse.success({});
      expect(response.status).toBe("success");
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe("Success");
      expect(response.data).toEqual({});
    });

    it("should create a success response with custom message and status code", () => {
      const data = { id: 1, name: "Test" };
      const response = ApiResponse.success(data, "Custom success message", 201);
      expect(response.status).toBe("success");
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe("Custom success message");
      expect(response.data).toEqual(data);
    });
  });

  describe("created", () => {
    it("should create a created response with default message", () => {
      const data = { id: 1, name: "Test" };
      const response = ApiResponse.created(data);
      expect(response.status).toBe("success");
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe("Created successfully");
      expect(response.data).toEqual(data);
    });

    it("should create a created response with custom message", () => {
      const data = { id: 1, name: "Test" };
      const response = ApiResponse.created(data, "Custom created message");
      expect(response.status).toBe("success");
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe("Custom created message");
      expect(response.data).toEqual(data);
    });
  });

  describe("noContent", () => {
    it("should create a no content response with default message", () => {
      const response = ApiResponse.noContent();
      expect(response).toEqual({
        status: "success",
        statusCode: 204,
        message: "No content",
      });
    });

    it("should create a no content response with custom message", () => {
      const response = ApiResponse.noContent("Custom no content message");
      expect(response).toEqual({
        status: "success",
        statusCode: 204,
        message: "Custom no content message",
      });
    });
  });

  describe("error", () => {
    it("should create an error response with default status code", () => {
      const response = ApiResponse.error("Error message");
      expect(response).toEqual({
        status: "error",
        statusCode: 400,
        message: "Error message",
      });
    });

    it("should create an error response with custom status code and error code", () => {
      const response = ApiResponse.error("Error message", 404, "NOT_FOUND");
      expect(response).toEqual({
        status: "error",
        statusCode: 404,
        message: "Error message",
        errorCode: "NOT_FOUND",
      });
    });

    it("should create an error response with validation errors", () => {
      const errors = [{ field: "name", errors: ["Name is required"] }];
      const response = ApiResponse.error("Validation error", 422, "VALIDATION_ERROR", errors);
      expect(response).toEqual({
        status: "error",
        statusCode: 422,
        message: "Validation error",
        errorCode: "VALIDATION_ERROR",
        errors,
      });
    });
  });

  describe("builder", () => {
    it("should return a new ResponseBuilder instance", () => {
      const builder = ApiResponse.builder();
      expect(builder).toBeInstanceOf(ResponseBuilder);
    });
  });

  describe("toJSON", () => {
    it("should convert a success response to JSON", () => {
      const data = { id: 1, name: "Test" };
      const response = new ApiResponse("success", 200, "Success", data);
      const json = response.toJSON();
      expect(json).toEqual({
        status: "success",
        statusCode: 200,
        message: "Success",
        data,
      });
    });

    it("should convert an error response to JSON", () => {
      const errors = [{ field: "name", errors: ["Name is required"] }];
      const response = new ApiResponse(
        "error",
        422,
        "Validation error",
        undefined,
        "VALIDATION_ERROR",
        errors,
      );
      const json = response.toJSON();
      expect(json).toEqual({
        status: "error",
        statusCode: 422,
        message: "Validation error",
        errorCode: "VALIDATION_ERROR",
        errors,
      });
    });
  });
});

describe("ResponseBuilder", () => {
  describe("build", () => {
    it("should build a response with default values", () => {
      const builder = new ResponseBuilder();
      const response = builder.build();
      expect(response.status).toBe("success");
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe("Success");
      expect(response.data).toBeUndefined();
    });

    it("should build a response with custom values", () => {
      const data = { id: 1, name: "Test" };
      const builder = new ResponseBuilder();
      const response = builder
        .setStatus("error")
        .setStatusCode(404)
        .setMessage("Not found")
        .setData(data)
        .setErrorCode("NOT_FOUND")
        .build();

      expect(response.status).toBe("error");
      expect(response.statusCode).toBe(404);
      expect(response.message).toBe("Not found");
      expect(response.data).toEqual(data);
      expect(response.errorCode).toBe("NOT_FOUND");
    });
  });

  describe("setters", () => {
    it("should set status", () => {
      const builder = new ResponseBuilder();
      const result = builder.setStatus("error");
      expect(result).toBe(builder);

      const response = builder.build();
      expect(response.status).toBe("error");
    });

    it("should set status code", () => {
      const builder = new ResponseBuilder();
      const result = builder.setStatusCode(404);
      expect(result).toBe(builder);

      const response = builder.build();
      expect(response.statusCode).toBe(404);
    });

    it("should set message", () => {
      const builder = new ResponseBuilder();
      const result = builder.setMessage("Custom message");
      expect(result).toBe(builder);

      const response = builder.build();
      expect(response.message).toBe("Custom message");
    });

    it("should set data", () => {
      const data = { id: 1, name: "Test" };
      const builder = new ResponseBuilder<typeof data>();
      const result = builder.setData(data);
      expect(result).toBe(builder);

      const response = builder.build();
      expect(response.data).toEqual(data);
    });

    it("should set error code", () => {
      const builder = new ResponseBuilder();
      const result = builder.setErrorCode("CUSTOM_ERROR");
      expect(result).toBe(builder);

      const response = builder.build();
      expect(response.errorCode).toBe("CUSTOM_ERROR");
    });

    it("should set errors", () => {
      const errors = [{ field: "name", errors: ["Name is required"] }];
      const builder = new ResponseBuilder();
      const result = builder.setErrors(errors);
      expect(result).toBe(builder);

      const response = builder.build();
      expect(response.errors).toEqual(errors);
    });
  });
});
