/**
 * Symbol used as metadata key for methods marked for manual error logging
 */
export const MANUAL_ERROR_LOGGING_METADATA_KEY = Symbol("manualErrorLogging");

/**
 * Method decorator that marks a controller method for manual error logging.
 * 
 * When applied to a method in a class decorated with @Controller,
 * this will skip automatic error logging, allowing the method to handle
 * error logging manually as needed.
 * 
 * @example
 * ```ts
 * @Controller({ logging: true })
 * export class UserController {
 *   @ManualErrorLogging()
 *   public async sensitiveMethod(req: Request, res: Response, next: NextFunction) {
 *     try {
 *       // Method implementation with sensitive data
 *       // that requires custom error logging
 *     } catch (error) {
 *       // Custom error logging logic here
 *       throw error; // Re-throw to maintain error handling flow
 *     }
 *   }
 *   

 * ```
 */
export function CustomErrorHandling() {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor,
  ): PropertyDescriptor | void {
    // Mark the method with metadata indicating it handles error logging manually
    Reflect.defineMetadata(MANUAL_ERROR_LOGGING_METADATA_KEY, true, target, propertyKey);

    return descriptor;
  };
}
