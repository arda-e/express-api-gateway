import { createControllerMethodWrapper } from "@utils/handlers/ControllerHandlers";
import { handleControllerError } from "@utils/handlers/errorHandlerUtil";
import { ErrorResponseBuilder } from "@utils/ResponseBuilder";

import { MANUAL_ERROR_LOGGING_METADATA_KEY } from "./CustomErrorHandling";
import "reflect-metadata"; // Import for metadata API

interface ControllerOptions {
  logging?: boolean;
  benchmarking?: boolean;
}

/**
 * Controller decorator that adds error handling and logging to controller methods.
 *
 * This decorator wraps all methods in a controller class with error handling and optional logging.
 * It automatically catches errors and sends appropriate error responses based on error type.
 *
 * Methods decorated with @ManualErrorLogging() will skip automatic error logging,
 * allowing for manual error handling and logging.
 *
 * @param options - Configuration options for the controller
 * @param options.logging - Enable request/response logging if true
 * @param options.benchmarking - Enable performance benchmarking if true
 *
 * @example
 * ```ts
 * @Controller({ logging: true })
 * export class UserController {
 *   public async getUsers(req: Request, res: Response, next: NextFunction) {
 *     // Method implementation with automatic error logging
 *   }
 *
 *   @ManualErrorLogging()
 *   public async sensitiveMethod(req: Request, res: Response, next: NextFunction) {
 *     // Method with custom error handling
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
          // Check if this method has the ManualErrorLogging decorator
          const hasManualErrorLogging = Reflect.getMetadata(
            MANUAL_ERROR_LOGGING_METADATA_KEY,
            target.prototype,
            method,
          );

          // Create wrapper with options
          const wrapperOptions = {
            errorHandler: handleControllerError,
            logging: hasManualErrorLogging ? false : options?.logging,
            benchmarking: options?.benchmarking,
          };

          // Create a method-specific wrapper with proper options
          const methodWrapper = createControllerMethodWrapper(wrapperOptions);

          // Apply the wrapper
          this[method] = methodWrapper(target.prototype[method], this);
        }
      }
    };
  };
}
