import { RequestHandler } from 'express';
import session, { SessionOptions } from 'express-session';
import RedisStore from 'connect-redis';
import { createClient, RedisClientType } from 'redis';
import Config from '@config/config';

import LoggerFactory from '../utils/Logger';

/**
 * The `SessionManager` class is responsible for managing the session middleware for the application. It sets up the Redis client connection, configures the session middleware, and provides access to the Redis client instance.
 * The `SessionManager` is implemented as a singleton, which means there can only be one instance of the class. The `initialize()` method is used to create the singleton instance and set up the necessary dependencies. The `getInstance()` method can then be used to retrieve the singleton instance.
 * The `configureSessionMiddleware()` method sets up the session middleware, including the Redis store, session options, and cookie settings. The `initRedisClient()` method initializes the Redis client connection, with a configurable timeout to ensure the connection is established within the specified time.
 * The `destroyInstance()` method can be used to destroy the current instance of the `SessionManager`, disconnecting the Redis client and setting the `instance` property to `null`.
 */
class SessionManager {
  private static instance: SessionManager | null = null;
  private redisClient: RedisClientType;
  private sessionMiddleware: RequestHandler;
  private static logger = LoggerFactory.getLogger();

  private constructor() {}

  /**
   * Initializes the singleton instance of the SessionManager class.
   * This method sets up the Redis client connection, configures the session middleware, and logs a message indicating that the session middleware has been initialized.
   * @returns {Promise<void>} A Promise that resolves when the initialization is complete.
   * @throws {Error} If the Redis client connection fails to be established.
   */
  public static async initialize(): Promise<void> {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
      await SessionManager.instance.initRedisClient(5000);
      SessionManager.instance.configureSessionMiddleware();
      SessionManager.logger.info('Session middleware initialized');
    }
  }

  /**
   * Retrieves the singleton instance of the SessionManager class.
   * @returns {SessionManager} The singleton instance of the SessionManager class.
   * @throws {Error} If the SessionManager has not been initialized by calling the `initialize()` method.
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      throw new Error('SessionManager not initialized. Call initialize() first.');
    }
    return SessionManager.instance;
  }

  /**
   * Configures the session middleware for the application.
   * This method creates a Redis store for the session data, sets the session options (including the secret, resave and saveUninitialized flags, and cookie settings), and attaches the session middleware to the application.
   */
  private configureSessionMiddleware(): void {
    const redisStore = new RedisStore({
      client: this.redisClient,
      disableTouch: true,
    });

    const sessionOptions: SessionOptions = {
      store: redisStore,
      secret: Config.app.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: Config.server.environment,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    };

    this.sessionMiddleware = session(sessionOptions);
  }

  /**
   * Retrieves the Redis client instance used by the SessionManager.
   * @returns {RedisClientType} The Redis client instance.
   */
  public getRedisClient(): RedisClientType {
    return this.redisClient;
  }

  public getSessionMiddleware(): RequestHandler {
    if (!this.sessionMiddleware) {
      throw new Error('Session middleware not configured. Call initialize() first.');
    }
    return this.sessionMiddleware;
  }

  /**
   * Initializes the Redis client used by the SessionManager.
   * This method attempts to connect to the Redis server with the configured URL, and retries up to the specified number of times if the connection fails.
   * @param timeout - The timeout in milliseconds for the Redis connection attempt.
   * @param maxRetries - The maximum number of retries to attempt if the connection fails.
   * @throws {Error} If the connection to Redis fails after the maximum number of retries.
   */
  private async initRedisClient(timeout: number = 5000, maxRetries: number = 5): Promise<void> {
    this.redisClient = createClient({
      // url: `redis://${Config.app.session.redis.host}:${Config.app.session.redis.port}`,
      url: 'redis://redis:6379',
    });
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await this.connectWithTimeout(timeout);
        return;
      } catch (err) {
        attempts += 1;
        SessionManager.logger.error(
          `Failed to connect to Redis (attempt ${attempts}/${maxRetries}): ${err.message}`,
        );
        if (attempts >= maxRetries) {
          throw new Error(
            `Failed to connect to Redis after ${maxRetries} attempts: ${err.message}`,
          );
        }
      }
    }
  }

  /**
   * Connects to the Redis server with a timeout.
   * This method creates a new Promise that resolves when the Redis connection is established, or rejects with an error if the connection times out.
   * @param timeout - The timeout in milliseconds for the Redis connection attempt.
   * @returns A Promise that resolves when the Redis connection is established, or rejects with an error if the connection times out.
   */
  private connectWithTimeout(timeout: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let connectionTimeout: NodeJS.Timeout;

      // A Promise that rejects after the specified timeout
      const timeoutPromise = new Promise<void>((_, reject) => {
        connectionTimeout = setTimeout(() => {
          reject(new Error(`Redis connection timed out after ${timeout} ms`));
        }, timeout) as NodeJS.Timeout;
      });

      // Redis client connection and event listeners
      /*-*/
      this.redisClient.connect();

      const connectPromise = new Promise<void>((resolve, reject) => {
        this.redisClient.on('connect', () => {
          clearTimeout(connectionTimeout);
          resolve();
        });

        this.redisClient.on('error', (err) => {
          clearTimeout(connectionTimeout);
          reject(err);
        });
      });
      /*-*/

      // Ensure the connection resolves or rejects based on the first completed promise
      Promise.race([timeoutPromise, connectPromise]).then(resolve).catch(reject);
    });
  }

  private cleanupRedisClient(): void {
    this.redisClient.removeAllListeners('connect');
    this.redisClient.removeAllListeners('error');
  }

  /**
   * Destroys the current instance of the SessionManager.
   * This method disconnects the Redis client, if it has been initialized, and sets the `instance` property to `null`.
   * If the SessionManager has not been initialized, this method will throw an error.
   */
  public static async destroyInstance(): Promise<void> {
    if (!SessionManager.instance) {
      throw new Error('SessionManager not initialized. Call initialize() first.');
    }

    if (SessionManager.instance.redisClient) {
      await SessionManager.instance.cleanupRedisClient();
      await SessionManager.instance.redisClient.quit();
      SessionManager.logger.info('Redis client disconnected.');
    } else {
      SessionManager.logger.warn('Redis client not initialized. Skipping disconnection.');
    }
    SessionManager.instance = null;
    SessionManager.logger.info('Session instance destroyed');
  }
}

export function getSessionMiddleware(): RequestHandler {
  const sessionManager = SessionManager.getInstance();
  return sessionManager.getSessionMiddleware();
}

export default SessionManager;
