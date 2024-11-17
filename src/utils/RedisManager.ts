import { createClient, RedisClientType } from 'redis';
import { singleton } from 'tsyringe';

import LoggerFactory from './Logger';

/**
 * The RedisManager class is a singleton that manages the connection to a Redis server.
 *
 * This class provides methods to initialize the Redis client, get the singleton instance of the RedisManager, and get the Redis client instance. It also includes methods to close the Redis client connection.
 *
 * The `initialize()` method should be called before using any other methods of the RedisManager class to ensure the Redis client is properly initialized.
 */
@singleton()
export class RedisManager {
  private redisClient: RedisClientType;
  private static logger = LoggerFactory.getLogger();

  constructor() {}

  /**
   * Initializes the Redis client and sets the singleton instance of the RedisManager class.
   * This method should be called before using any other methods of the RedisManager class.
   *
   * @async
   * @throws {Error} If the Redis client fails to connect after the specified number of retries.
   * @returns {Promise<void>} A Promise that resolves when the Redis client is successfully initialized.
   */
  public async initialize(): Promise<void> {
    await this.initRedisClient();
    RedisManager.logger.info('Redis client initialized');
  }

  /**
   * Gets the Redis client instance.
   *
   * This method returns the Redis client instance that was initialized by the `initialize()` method.
   * It can be used to interact with the Redis server.
   *
   * @returns {RedisClientType} The Redis client instance.
   */
  public getRedisClient(): RedisClientType {
    return this.redisClient;
  }

  /**
   * Initializes the Redis client with the specified timeout and maximum number of retries.
   *
   * This method creates a new Redis client, attempts to connect to the Redis server with the specified timeout, and retries the connection up to the maximum number of retries if the connection fails.
   *
   * @param timeout - The timeout in milliseconds for the Redis connection. Defaults to 5000 ms.
   * @param maxRetries - The maximum number of retries for the Redis connection. Defaults to 5.
   * @throws {Error} If the Redis client fails to connect after the specified number of retries.
   * @returns {Promise<void>} A Promise that resolves when the Redis client is successfully initialized.
   */
  private async initRedisClient(timeout: number = 5000, maxRetries: number = 5): Promise<void> {
    this.redisClient = createClient({
      url: 'redis://redis:6379',
      //url: `redis://${Config.app.session.redis.host}:${Config.app.session.redis.port}`,
    });
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await this.connectWithTimeout(timeout);
        return;
      } catch (error) {
        attempts += 1;
        const errorMessage = error instanceof Error ? error.message : String(error);

        RedisManager.logger.error(
          `Failed to connect to Redis (attempt ${attempts}/${maxRetries}): ${errorMessage}`,
        );
        if (attempts >= maxRetries) {
          throw new Error(
            `Failed to connect to Redis after ${maxRetries} attempts: ${errorMessage}`,
          );
        }
      }
    }
  }

  /**
   * Connects the Redis client with a timeout.
   *
   * @param timeout - The timeout in milliseconds for the Redis connection.
   * @returns A Promise that resolves when the Redis client is connected, or rejects with an error if the connection times out.
   */
  private connectWithTimeout(timeout: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let connectionTimeout: NodeJS.Timeout | number | null;

      const timeoutPromise = new Promise<void>((_, reject) => {
        connectionTimeout = setTimeout(() => {
          reject(new Error(`Redis connection timed out after ${timeout} ms`));
        }, timeout) as NodeJS.Timeout;
      });

      // !TODO:
      this.redisClient.connect();

      const connectPromise = new Promise<void>((resolve, reject) => {
        this.redisClient.on('connect', () => {
          clearTimeout(connectionTimeout as NodeJS.Timeout);
          resolve();
        });

        this.redisClient.on('error', (err) => {
          clearTimeout(connectionTimeout as NodeJS.Timeout);
          reject(err);
        });
      });

      Promise.race([timeoutPromise, connectPromise]).then(resolve).catch(reject);
    });
  }

  /**
   * Closes the Redis client connection.
   *
   * This method disconnects the Redis client and logs a message indicating that the client has been disconnected.
   *
   * @returns A Promise that resolves when the Redis client has been disconnected.
   */
  public async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      RedisManager.logger.info('Redis client disconnected.');
    }
  }
}
