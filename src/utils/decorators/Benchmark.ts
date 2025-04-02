export const BENCHMARK_METADATA_KEY = Symbol("benchmarked_method");

/**
 * Method decorator that marks a controller method for benchmarking.
 * When used with the @Controller decorator, this will measure and log
 * the execution time of the method.
 *
 * @example
 * ```ts
 * @Controller()
 * export class UserController {
 *   @Benchmark()
 *   public async getUsers(req: Request, res: Response) {
 *     return await this.userService.getUsers();
 *   }
 * }
 * ```
 */
export function Benchmark() {
  return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor): void {
    Reflect.defineMetadata(BENCHMARK_METADATA_KEY, true, target, propertyKey);
  };
}
