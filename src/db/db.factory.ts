import Logger from '@utils/Logger';

import { Database } from './db.interface';
import KnexAdapter from './knex.adapter';

const logger = Logger.getLogger();

type DatabaseConstructor = new (maxRetries: number, retryDelay: number) => Database;

class DatabaseFactory {
  private static instance: Database | null = null;

  public static createDatabase(
    AdapterClass: DatabaseConstructor = KnexAdapter,
    maxRetries = 5,
    retryDelay = 1000,
  ): Database {
    if (DatabaseFactory.instance) {
      return DatabaseFactory.instance;
    }

    try {
      DatabaseFactory.instance = new AdapterClass(maxRetries, retryDelay);
      return DatabaseFactory.instance;
    } catch (error) {
      logger.error('Failed to create database adapter:', error);
      throw new Error('Database initialization failed');
    }
  }

  public static getDatabase(): Database {
    if (!DatabaseFactory.instance) {
      throw new Error('Database instance has not been created yet.');
    }
    return DatabaseFactory.instance;
  }
}

export default DatabaseFactory;
