export const CUSTOM_ERROR_HANDLER_KEY = Symbol("customErrorHandler");

export function CustomErrorHandler() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return await originalMethod.apply(this, args);
    };
  };
}
