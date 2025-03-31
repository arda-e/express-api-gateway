import { StatusCodes } from "http-status-codes";
import * as Errors from "@utils/errors";

// Array of error types that should be passed through without wrapping
const PASSTHROUGH_ERROR_TYPES = [
  Errors.ResourceDoesNotExistError,
  Errors.ResourceAlreadyExistsError,
  Errors.ValidationError,
  Errors.AuthenticationError,
  Errors.AuthorizationError,
  Errors.AppError,
];

/**
 * Checks if an error should be passed through without wrapping
 * @param error - The error to check
 * @returns True if the error should be passed through, false otherwise
 */
const shouldPassThroughError = (error: unknown): boolean => {
  return PASSTHROUGH_ERROR_TYPES.some((errorType) => error instanceof errorType);
};

/**
 * Decorator function that wraps service methods with standard error handling.
 * This decorator will:
 * 1. Pass through specific error types like ResourceDoesNotExistError
 * 2. Wrap unknown errors in DatabaseError with a descriptive message
 *
 * @param errorMessage - Custom error message prefix to use for unknown errors
 * @returns Method decorator function
 *
 * @example
 * ```ts
 * class UserService {
 *   @Catch('Failed to retrieve user')
 *   async getUser(id: string): Promise<User> {
 *     // Your method implementation
 *   }
 * }
 * ```
 */
export function Catch(errorMessage: string) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        // Re-throw specific error types that should be handled at a higher level
        if (shouldPassThroughError(error)) {
          throw error;
        }

        // Wrap unknown errors in DatabaseError
        throw new Errors.DatabaseError(
          `${errorMessage}: ${(error as Error)?.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    };

    return descriptor;
  };
}
