import {
  getControllerMethods,
  hasCustomResponseHandling,
  shouldBenchmarkMethod,
  shouldLogMethod,
} from "./metadata";
import { createMethodWrapper } from "./method-wrapper";
import { ControllerOptions } from "./types";

/**
 * Controller class decorator that applies response handling to all methods.
 *
 * This decorator automatically wraps all methods in a controller class to:
 * 1. Handle ApiResponse objects and convert them to HTTP responses
 * 2. Automatically format regular return values as JSON responses
 * 3. Catch errors and pass them to Express's error handling middleware
 * 4. Apply benchmarking to methods marked with @Benchmark()
 *
 * @param options Configuration options for the controller
 * @returns Class decorator function
 *
 * @example
 * ```ts
 * @Controller()
 * export class UserController {
 *   constructor(private userService: UserService) {}
 *
 *   // Auto-formatted as JSON response
 *   async getUsers(req: Request, res: Response) {
 *     return await this.userService.getUsers();
 *   }
 *
 *   // Using ApiResponse for more control
 *   async createUser(req: Request, res: Response) {
 *     const user = await this.userService.createUser(req.body);
 *     return ApiResponse.created(user);
 *   }
 * }
 * ```
 */
export function Controller(options: ControllerOptions = {}) {
  return function <T extends { new (...args: any[]): any }>(target: T) {
    return class extends target {
      constructor(...args: any[]) {
        super(...args);

        const methods = getControllerMethods(target);

        // Wrap each method with response handling
        for (const methodName of methods) {
          const originalMethod = target.prototype[methodName];

          // Skip wrapping if it has custom response handling
          if (hasCustomResponseHandling(target, methodName)) {
            continue;
          }

          const shouldBenchmark = shouldBenchmarkMethod(target, methodName, !!options.benchmarking);
          const shouldLog = shouldLogMethod(target, methodName, !!options.logging);

          // Create and assign the wrapper function
          this[methodName] = createMethodWrapper(
            originalMethod,
            methodName,
            shouldBenchmark,
            shouldLog,
          );
        }
      }
    };
  };
}
