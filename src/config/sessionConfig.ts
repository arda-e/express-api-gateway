import { RequestHandler } from 'express';
import session, { SessionOptions } from 'express-session';
import RedisStore from 'connect-redis';
import Config from '@config/config';
import { RedisManager } from '@utils/RedisManager';

import LoggerFactory from '../utils/Logger';

/**
 * Manages the session middleware for the application.
 *
 * This class is responsible for initializing and configuring the session middleware, which is used to manage user sessions.
 * It uses a Redis store to persist session data, and provides methods to retrieve the configured session middleware.
 *
 * The `SessionManager` is a singleton class, and should be initialized once during application startup by calling the `initialize()` method.
 */
export class SessionManager {
  private static instance: SessionManager | null = null;
  private sessionMiddleware: RequestHandler;
  private static logger = LoggerFactory.getLogger();

  private constructor(private redisManager: RedisManager) {}

  /**
   * Initializes the singleton instance of the `SessionManager` class and configures the session middleware.
   *
   * This method should be called once during application startup to set up the session management functionality.
   *
   * @param redisManager - The `RedisManager` instance to be used for the session store.
   * @returns A Promise that resolves when the session middleware has been configured.
   * @throws {Error} If the `SessionManager` has already been initialized.
   */
  public static async initialize(redisManager: RedisManager): Promise<void> {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(redisManager);
      SessionManager.instance.configureSessionMiddleware();
      SessionManager.logger.info('Session middleware initialized');
    }
  }

  /**
   * Gets the singleton instance of the `SessionManager` class.
   *
   * @returns {SessionManager} The singleton instance of the `SessionManager` class.
   * @throws {Error} If the `SessionManager` has not been initialized by calling the `initialize()` method.
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      throw new Error('SessionManager not initialized. Call initialize() first.');
    }
    return SessionManager.instance;
  }

  private configureSessionMiddleware(): void {
    const redisStore = new RedisStore({
      client: this.redisManager.getRedisClient(),
      disableTouch: true,
    });

    const sessionOptions: SessionOptions = {
      store: redisStore,
      secret: Config.app.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: Config.server.environment === 'production',
        httpOnly: true,
        maxAge: Config.app.session.cookie.maxAge,
      },
    };

    this.sessionMiddleware = session(sessionOptions);
  }

  /**
   * Gets the session middleware configured for the application.
   *
   * This method should be called to retrieve the session middleware after the `SessionManager` has been initialized.
   *
   * @returns {RequestHandler} The configured session middleware.
   * @throws {Error} If the session middleware has not been configured by calling the `initialize()` method.
   */
  public getSessionMiddleware(): RequestHandler {
    if (!this.sessionMiddleware) {
      throw new Error('Session middleware not configured. Call initialize() first.');
    }
    return this.sessionMiddleware;
  }
}
/**
 * Gets the session middleware configured for the application.
 *
 * This function should be called to retrieve the session middleware after the `SessionManager` has been initialized.
 *
 * @returns {RequestHandler} The configured session middleware.
 * @throws {Error} If the session middleware has not been configured by calling the `initialize()` method on the `SessionManager`.
 */
export const getSessionMiddleware = (): RequestHandler => {
  return SessionManager.getInstance().getSessionMiddleware();
};
