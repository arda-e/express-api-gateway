import { container } from "tsyringe";

import { CacheService } from "./CacheService";

export function InvalidateCache(keyPattern: string) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      const cacheService = container.resolve<CacheService>(CacheService);

      await cacheService.delete(keyPattern);

      return result;
    };

    return descriptor;
  };
}
