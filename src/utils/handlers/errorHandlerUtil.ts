import {
  UniqueConstraintError,
  ResourceDoesNotExistError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  AppError,
} from "@utils/errors";
import { ErrorResponseBuilder } from "@utils/ResponseBuilder";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

/**
 * Maps error types to appropriate status codes and messages
 */
const ERROR_MAPPINGS: Record<string, { statusCode: number; defaultMessage: string }> = {
  ValidationError: { statusCode: StatusCodes.BAD_REQUEST, defaultMessage: "Invalid request data" },
  AuthenticationError: {
    statusCode: StatusCodes.UNAUTHORIZED,
    defaultMessage: "Authentication required",
  },
  AuthorizationError: { statusCode: StatusCodes.FORBIDDEN, defaultMessage: "Access denied" },
  ResourceDoesNotExistError: {
    statusCode: StatusCodes.NOT_FOUND,
    defaultMessage: "Resource not found",
  },
  // Add more error types as needed
};

/**
 * Handles controller-level errors by mapping them to appropriate HTTP responses.
 * Handles common error types and passes unknown errors to the next middleware.
 *
 * @param error - The error to handle
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 */
export function handleControllerError(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Log the error (unless disabled by ManualErrorLogging decorator)
  console.error(
    `${new Date().toISOString()} | ERROR | ${req.method} ${req.path} | ${error.name}: ${error.message}`,
  );
  console.error(error.stack);

  // Handle known error types
  const errorType = error.constructor.name;
  const errorConfig = ERROR_MAPPINGS[errorType] || {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    defaultMessage: "Internal server error",
  };

  // Use custom status code from AppError if available
  const statusCode = error instanceof AppError ? error.statusCode : errorConfig.statusCode;

  // Use error message or default message
  const message = error.message || errorConfig.defaultMessage;

  // Send error response
  res.status(statusCode).json(new ErrorResponseBuilder(statusCode, message).build());
}
