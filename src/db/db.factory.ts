import { Database } from './db.interface';
import KnexAdapter from './knex.adapter';

/**
 * Creates and returns a database adapter instance.
 *
 * This factory function initializes a new instance of the database adapter,
 * and returns it.
 *
 * By default, it uses the KnexAdapter, but this can be modified to use any
 * other adapter that implements the Database interface.
 *
 * @param maxRetries - The maximum number of retry attempts for establishing a database connection.
 *                     Default value is 5.
 * @param retryDelay - The delay between retry attempts in milliseconds.
 *                     Default value is 1000 ms.
 * @returns An instance of a class that implements the Database interface.
 */
const createDatabase = (maxRetries = 5, retryDelay = 1000): Database => {
        return new KnexAdapter(maxRetries, retryDelay);
};

export default createDatabase;