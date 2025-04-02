import { createHandleDatabaseError } from "./handler-factory";
import { PostgresErrorConfig } from "./config";

export const handleDatabaseError = createHandleDatabaseError({
  enableLogging: true,
});

type ErrorMessageProvider = string | ((...args: any[]) => string);

export function ExceptionHandler(errorMessage: ErrorMessageProvider, config?: PostgresErrorConfig) {
  const localHandler = config ? createHandleDatabaseError(config) : handleDatabaseError;

  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const message = typeof errorMessage === "function" ? errorMessage(...args) : errorMessage;
        localHandler(error, message);
      }
    };

    return descriptor;
  };
}
