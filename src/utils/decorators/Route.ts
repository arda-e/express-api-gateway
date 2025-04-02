import { ApiResponse } from "@utils/Response";
import { Request, Response, NextFunction } from "express";

/**
 * Method decorator that wraps a controller method to handle HTTP responses.
 *
 * This decorator is designed to be used with methods in classes that handle
 * HTTP requests. It automatically processes the method's return value and
 * sends an appropriate HTTP response. The decorator supports both custom
 * `ApiResponse` objects and regular data, ensuring that the response is
 * correctly formatted and sent to the client.
 *
 * @param options - Configuration options for the route (currently unused)
 * @returns Method decorator function
 *
 * @example
 * ```ts
 * class UserController {
 *   @Route()
 *   public async getUser(req: Request, res: Response, next: NextFunction) {
 *     const user = await this.userService.getUser(req.params.id);
 *     return user; // Automatically sent as JSON response
 *   }
 * }
 * ```
 */
export function Route(options = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const result = await originalMethod.apply(this, [req, res, next]);

        // Handle ApiResponse objects
        if (result instanceof ApiResponse) {
          return res.status(result.statusCode).json({
            data: result.data,
            message: result.message,
          });
        }

        // Handle regular data
        if (!res.headersSent) {
          return res.status(200).json({
            data: result,
            message: "Success",
          });
        }
      } catch (error) {
        // Pass the error to the next middleware (error handler)
        next(error);
      }
    };

    return descriptor;
  };
}
