export const CUSTOM_RESPONSE_HANDLING_KEY = Symbol("customResponseHandling");

/**
 * Method decorator that marks a controller method to handle its own response.
 *
 * When applied to a method in a class decorated with @Controller,
 * this will skip automatic response handling, allowing the method to
 * manage the HTTP response directly.
 *
 * @example
 * ```ts
 * @Controller()
 * export class UserController {
 *   @CustomResponse()
 *   public async downloadFile(req: Request, res: Response) {
 *     const file = await this.userService.generateFile();
 *     res.setHeader('Content-Type', 'application/pdf');
 *     return res.download(file.path, file.name);
 *   }
 * }
 * ```
 */
export function CustomResponse() {
  return function (target: any, propertyKey: string | symbol): void {
    Reflect.defineMetadata(CUSTOM_RESPONSE_HANDLING_KEY, true, target, propertyKey);
  };
}
