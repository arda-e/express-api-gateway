import { container } from 'tsyringe';
import { RedisManager } from '@utils/RedisManager';
import DatabaseFactory from '@db/db.manager';
import LoggerFactory from '@utils/Logger';

import SessionConfig from './sessionConfig';

const logger = LoggerFactory.getLogger();

export const initializeDependencies = async (
  sessionManager: SessionConfig = container.resolve(SessionConfig),
  databaseFactory: DatabaseFactory = container.resolve(DatabaseFactory),
): Promise<void> => {
  try {
    const redisManager = container.resolve(RedisManager);
    await redisManager.initialize();
    logger.info('Redis initialized');

    // Initialize session middleware with injected or default session manager
    sessionManager.getSessionMiddleware();
    logger.info('Session middleware initialized');
    // Initialize database with injected or default database factory
    await databaseFactory.createDatabase();
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to initialize dependencies: ${error.message}`);
    } else {
      logger.error('Failed to initialize dependencies: Unknown error');
    }
    throw error;
  }
};
