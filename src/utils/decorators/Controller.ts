import {
  UniqueConstraintError,
  ResourceDoesNotExistError,
  AuthenticationError,
} from "@utils/errors";
import { ErrorResponseBuilder } from "@utils/ResponseBuilder";
import { StatusCodes } from "http-status-codes";

interface ControllerOptions {
  logging?: boolean;
  // Add more options in the future
}

/**
 * Controller decorator that adds error handling and logging to controller methods.
 *
 * This decorator wraps all methods in a controller class with error handling and optional logging.
 * It automatically catches errors and sends appropriate error responses based on error type.
 *
 * @param options - Configuration options for the controller
 * @param options.logging - Enable request/response logging if true
 *
 * @example
 * ```ts
 * @Controller({ logging: true })
 * export class UserController {
 *   public async getUsers(req: Request, res: Response, next: NextFunction) {
 *     // Method implementation
 *   }
 * }
 * ```
 */
export function Controller(options?: ControllerOptions) {
  return function <T extends { new (...args: any[]): any }>(target: T) {
    return class extends target {
      constructor(...args: any[]) {
        super(...args);

        // Get all method names from the class prototype
        const methods = Object.getOwnPropertyNames(target.prototype).filter(
          (prop) => typeof target.prototype[prop] === "function" && prop !== "constructor",
        );

        // Wrap each method with error handling and logging
        for (const method of methods) {
          const originalMethod = this[method];

          this[method] = async function (...args: any[]) {
            const [req, res, next] = args;

            try {
              // Log the request (if logging is enabled)
              if (options?.logging) {
                console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | Started`);
              }

              // Call the original controller method
              const result = await originalMethod.apply(this, args);

              // Log the successful response
              if (options?.logging) {
                console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | Completed`);
              }

              return result;
            } catch (error) {
              // Log the error
              if (options?.logging) {
                console.error(
                  `${new Date().toISOString()} | ${req.method} ${req.path} | Error:`,
                  error,
                );
              }

              // Handle different error types
              if (error instanceof UniqueConstraintError) {
                res
                  .status(error.statusCode)
                  .json(new ErrorResponseBuilder(StatusCodes.CONFLICT, error.message).build());
              } else if (error instanceof ResourceDoesNotExistError) {
                res
                  .status(StatusCodes.NOT_FOUND)
                  .json(new ErrorResponseBuilder(StatusCodes.NOT_FOUND, error.message).build());
              } else if (error instanceof AuthenticationError) {
                // For security reasons, use a generic error message for authentication failures
                // instead of exposing the actual error message
                res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(
                    new ErrorResponseBuilder(
                      StatusCodes.UNAUTHORIZED,
                      "Wrong email or password.",
                    ).build(),
                  );
              } else {
                // Forward to Express error handler for unknown errors
                next(error);
              }
            }
          };
        }
      }
    };
  };
}
