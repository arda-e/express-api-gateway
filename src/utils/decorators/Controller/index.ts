import {
  getControllerMethods,
  hasCustomResponseHandling,
  shouldBenchmarkMethod,
  shouldLogMethod,
  CONTROLLER_METADATA_KEY,
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
    // Mark the class as a controller by setting metadata
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, options, target);

    return class extends target {
      constructor(...args: any[]) {
        super(...args);

        const methods = getControllerMethods(target);

        // Wrap each method with response handling
        for (const methodName of methods) {
          // Skip wrapping if it has custom response handling
          if (hasCustomResponseHandling(target, methodName)) {
            continue;
          }

          const originalMethod = this[methodName];
          const shouldBenchmark = shouldBenchmarkMethod(
            target,
            methodName,
            options.benchmarking ?? false,
          );
          const shouldLog = shouldLogMethod(target, methodName, options.logging ?? false);

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

/**
 * Checks if a class is decorated with @Controller
 */
export function isController(target: any): boolean {
  return !!Reflect.getMetadata(CONTROLLER_METADATA_KEY, target);
}
