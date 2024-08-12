import { RedisManager } from '@utils/RedisManager';

import { SessionManager } from './sessionConfig';
import DatabaseFactory from '../db/db.factory';
import KnexAdapter from '../db/knex.adapter';
import Config from './config';
import LoggerFactory from '../utils/Logger';

const logger = LoggerFactory.getLogger();

export const initializeDependencies = async (): Promise<void> => {
  try {
    // Initialize Redis
    await RedisManager.initialize();
    const redisManager = RedisManager.getInstance();
    logger.info('Redis initialized');

    // Initialize session middleware
    await SessionManager.initialize(redisManager);
    logger.info('Session middleware initialized');

    // Initialize database
    const db = DatabaseFactory.createDatabase(
      KnexAdapter,
      Config.db.maxRetries,
      Config.db.retryDelay,
    );
    await db.initialize();
    logger.info('Database initialized');
  } catch (error) {
    logger.error(`Failed to initialize dependencies: ${error.message}`);
    throw error;
  }
};
