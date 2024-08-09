import Logger from '@utils/Logger';

import { Database } from '../db/db.interface';
import KnexAdapter from '../db/knex.adapter';
import Config from './config';

const logger = Logger.getLogger();

/**
 * Initializes the application's dependencies, including the Redis session middleware and the database connection.
 *
 * This function is responsible for setting up the necessary dependencies for the application to function properly.
 * It first initializes the Redis session middleware, and then creates and initializes the database connection.
 *
 * If any errors occur during the initialization process, they are logged and the errors are re-thrown.
 *
 * @returns {Promise<Database>} The initialized database connection.
 */
const initializeDependencies = async (
  SessionConfig: typeof SessionConfig,
  DatabaseFactory: typeof DatabaseFactory,
): Promise<Database> => {
  // Initialize Redis and session middleware
  try {
    await SessionConfig.initialize();
    logger.info('Redis and session middleware initialized');
  } catch (error) {
    logger.error(`Failed to initialize Redis and session middleware: ${error.message}`);
    throw error;
  }
  // Initialize database
  try {
    const db: Database = DatabaseFactory.createDatabase(
      KnexAdapter,
      Config.db.maxRetries,
      Config.db.retryDelay,
    );
    await db.initialize();
    logger.info('Database initialized');
  } catch (error) {
    logger.error(`Failed to initialize database: ${error.message}`);
    throw error;
  }
};

export { initializeDependencies };
