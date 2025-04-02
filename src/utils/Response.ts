import { ResponseBuilder } from "./ResponseBuilder";

/**
 * Represents a response object.
 *
 * @template T - The type of the data.
 */
export class ApiResponse<T> {
  constructor(
    public readonly status: "success" | "error" = "success",
    public readonly statusCode: number = 200,
    public readonly message: string = "Success",
    public readonly data?: T,
    public readonly errorCode?: string,
    public readonly errors?: Array<{ field: string; errors: string[] }>,
  ) {}

  /**
   * Creates a success response with the given data, message, and status code.
   *
   * @template T - The type of the data.
   * @param {T} data - The data to include in the response.
   * @param {string} [message="Success"] - The message to include in the response.
   * @param {number} [statusCode=200] - The status code to include in the response.
   * @returns {object} The JSON representation of the success response.
   */
  static success<T>(data: T, message = "Success", statusCode = 200): ApiResponse<T> {
    return new ApiResponse("success", statusCode, message, data);
  }

  /**
   * Creates a created response with the given data and message.
   *
   * @template T - The type of the data.
   * @param {T} data - The data to include in the response.
   * @param {string} [message="Created successfully"] - The message to include in the response.
   * @returns {object} The JSON representation of the created response.
   */
  static created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return new ApiResponse("success", 201, message, data);
  }

  static noContent(message = "No content"): object {
    return new ApiResponse("success", 204, message).toJSON();
  }

  /**
   * Creates an error response with the given message, status code, error code, and errors.
   *
   * @param {string} message - The message to include in the error response.
   * @param {number} [statusCode=400] - The status code to include in the error response.
   * @param {string} [errorCode] - The error code to include in the error response.
   * @param {Array<{ field: string; errors: string[] }>} [errors] - The errors to include in the error response.
   * @returns {object} The JSON representation of the error response.
   */
  static error(
    message: string,
    statusCode = 400,
    errorCode?: string,
    errors?: Array<{ field: string; errors: string[] }>,
  ): object {
    return new ApiResponse("error", statusCode, message, undefined, errorCode, errors).toJSON();
  }

  /**
   * Creates and returns a new instance of the ResponseBuilder class.
   *
   * @returns {ResponseBuilder<T>} A new instance of the ResponseBuilder class.
   */
  static builder<T>(): ResponseBuilder<T> {
    return new ResponseBuilder<T>();
  }

  /**
   * Converts the Response object to a JSON representation.
   *
   * @returns {object} The JSON representation of the Response object.
   */
  toJSON(): object {
    const response: any = {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
    };

    if (this.data !== undefined) {
      response.data = this.data;
    }

    if (this.status === "error") {
      if (this.errorCode) response.errorCode = this.errorCode;
      if (this.errors) response.errors = this.errors;
    }

    return response;
  }
}
