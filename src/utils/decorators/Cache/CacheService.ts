import { RedisManager } from "@utils/RedisManager";
import { RedisClientType } from "redis";
import { container, singleton } from "tsyringe";

@singleton()
export class CacheService {
  private redis: RedisClientType;

  constructor() {
    this.redis = container.resolve<RedisManager>(RedisManager).getRedisClient();
  }

  public async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, { EX: ttl });
    } else {
      await this.redis.set(key, value);
    }
  }

  public async delete(key: string): Promise<void> {
    // If key contains wildcard, use KEYS to find matching keys and delete them
    if (key.includes("*")) {
      const matchingKeys = await this.redis.keys(key);
      if (matchingKeys.length > 0) {
        await this.redis.del(matchingKeys);
      }
    } else {
      await this.redis.del(key);
    }
  }

  public async clear(): Promise<void> {
    await this.redis.flushAll();
  }

  public async close(): Promise<void> {
    await this.redis.quit();
  }
}
