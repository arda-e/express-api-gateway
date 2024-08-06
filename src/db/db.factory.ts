import Logger from '@utils/Logger';

import KnexAdapter from './knex.adapter';
import { Database } from './db.interface';

const logger = Logger.getLogger();

type DatabaseConstructor = new (maxRetries: number, retryDelay: number) => Database;

/**
 * Creates and returns a database adapter instance.
 *
 * This factory function initializes a new instance of the database adapter,
 * and returns it.
 *
 * By default, it uses the KnexAdapter, but this can be modified to use any
 * other adapter that implements the Database interface.
 *
 * @param AdapterClass - The database adapter class to be instantiated.
 * It should be a class that implements the Database interface.
 * Default value is KnexAdapter.
 * @param maxRetries - The maximum number of retry attempts for establishing a database connection.
 * Default value is 5.
 * @param retryDelay - The delay between retry attempts in milliseconds.
 * Default value is 1000 ms.
 * @returns An instance of a class that implements the Database interface.
 */
const createDatabase = (
  AdapterClass: DatabaseConstructor = KnexAdapter,
  maxRetries = 5,
  retryDelay = 1000,
): Database => {
  try {
    return new AdapterClass(maxRetries, retryDelay);
  } catch (error) {
    logger.error('Failed to create database adapter:', error);
    throw new Error('Database initialization failed');
  }
};

export default createDatabase;
