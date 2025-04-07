import { isController } from "./Controller";

export const CUSTOM_RESPONSE_HANDLING_KEY = Symbol("customResponseHandling");
export const CUSTOM_RESPONSE_METHODS_KEY = Symbol("customResponseMethods");

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
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    // Set the metadata for the method
    Reflect.defineMetadata(CUSTOM_RESPONSE_HANDLING_KEY, true, target, propertyKey);

    // Store the original method
    const originalMethod = descriptor.value;

    // Replace the method with our wrapped version
    descriptor.value = async function (...args: any[]) {
      if (!isController(this.constructor)) {
        throw new Error(
          `@CustomResponse decorator can only be used on methods within a class decorated with @Controller. Error on method: ${String(propertyKey)}`,
        );
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
