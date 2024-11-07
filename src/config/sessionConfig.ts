import { RequestHandler } from 'express';
import Config from '@config/config';
import { singleton, inject, container } from 'tsyringe';
import session, { SessionOptions } from 'express-session';
import RedisStore from 'connect-redis';
import { RedisManager } from '@utils/RedisManager';
import { RedisClientType } from 'redis';

import LoggerFactory from '../utils/Logger';

const SESSION_SECRET = Config.app.session.secret;
const SESSION_COOKIE_MAX_AGE = Config.app.session.cookie.maxAge;
const SESSION_ENVIRONMENT = Config.server.environment === 'production';

/**
 * Manages the session middleware for the application.
 *
 * This class is responsible for initializing and configuring the session middleware, which is used to manage user sessions.
 * It uses a Redis store to persist session data, and provides methods to retrieve the configured session middleware.
 *
 * The `SessionManager` is a singleton class and is initialized once during application startup by the DI container.
 */
@singleton()
class SessionManager {
  private readonly sessionMiddleware: RequestHandler;
  private static logger = LoggerFactory.getLogger();

  constructor(@inject(RedisManager) private redisManager: RedisManager) {
    this.sessionMiddleware = this.configureSessionMiddleware();
    SessionManager.logger.info('Session middleware initialized');
  }

  /**
   * Configures the session middleware for the application.
   *
   * This method sets up the session options and Redis store for managing sessions.
   *
   * @returns {RequestHandler} The configured session middleware.
   */
  private configureSessionMiddleware(): RequestHandler {
    const redisStore = new RedisStore({
      client: this.getRedisClient,
      disableTouch: true,
    });

    const sessionOptions: SessionOptions = {
      store: redisStore,
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: SESSION_ENVIRONMENT,
        httpOnly: true,
        maxAge: SESSION_COOKIE_MAX_AGE,
      },
    };

    return session(sessionOptions);
  }

  public getRedisClient(): RedisClientType {
    return this.redisManager.getRedisClient();
  }

  /**
   * Gets the session middleware configured for the application.
   *
   * This method should be called to retrieve the session middleware after the `SessionManager` has been initialized.
   *
   * @returns {RequestHandler} The configured session middleware.
   */
  public getSessionMiddleware(): RequestHandler {
    return this.sessionMiddleware;
  }

  /**
   * Destroys the session manager instance and closes the Redis connection.
   *
   * This method should be called during the graceful shutdown process to clean up resources.
   */
  public async destroy(): Promise<void> {
    SessionManager.logger.info('Destroying session manager and closing Redis connection');
    try {
      await this.redisManager.getRedisClient().quit();
    } catch (error) {
      SessionManager.logger.error('Failed to close Redis connection:', error);
    }
  }
}

export default SessionManager;

/**
 * Gets the session middleware configured for the application.
 *
 * This function should be called to retrieve the session middleware after the `SessionManager` has been initialized.
 *
 * @returns {RequestHandler} The configured session middleware.
 */
export const getSessionMiddleware = (): RequestHandler => {
  const sessionManager = container.resolve(SessionManager);
  return sessionManager.getSessionMiddleware();
};
