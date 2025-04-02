export const LOGGER_METADATA_KEY = Symbol("logger_method");

/**
 * Method decorator that marks a controller method for logging.
 * When used with the @Controller decorator, this will log
 * the execution of the method.
 *
 * @example
 * ```ts
 * @Controller()
 * export class UserController {
 *   @Logger()
 *   public async getUsers(req: Request, res: Response) {
 *     return await this.userService.getUsers();
 *   }
 * }
 * ```
 */
export function Logger() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(LOGGER_METADATA_KEY, true, target, propertyKey);
  };
}
