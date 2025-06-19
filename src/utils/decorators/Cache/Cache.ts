import { container } from "tsyringe";
import LoggerFactory from "@utils/Logger";

import { CacheService } from "./CacheService";

export interface CacheOptions {
  ttl?: number; // in milliseconds
}
export const CACHE_SYMBOL = Symbol("cache");

/**
 * Set-and-forget decorator to cache method results in Redis.
 * Automatically wraps the method and caches based on arguments.
 */
export function Cache(options: CacheOptions = {}) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value[CACHE_SYMBOL] = options;

    const logger = LoggerFactory.getLogger();

    descriptor.value = async function (...args: any[]) {
      const cacheService = container.resolve<CacheService>(CacheService);
      const ttl = options.ttl ?? 5000;
      const cacheKey = `${this.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      try {
        const cached = await cacheService.get(cacheKey);
        if (cached !== null && cached !== undefined) return cached;
      } catch (err) {
        logger.error("Cache get error:", err);
      }

      const result = await originalMethod.apply(this, args);

      try {
        await cacheService.set(cacheKey, result, ttl);
      } catch (err) {
        logger.error("Cache set error:", err);
      }
      return result;
    };

    return descriptor;
  };
}
