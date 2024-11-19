import knex, { Knex } from 'knex';
import knexConfig from '@config/knexfile';

import DbAdapter from './db.adapter';

const environment = process.env.NODE_ENV || 'development';
const environmentConfig = knexConfig[environment];

/**
 * KnexAdapter is a concrete implementation of the DbAdapter for Knex.
 * It handles database connection, querying, and connection testing using Knex.
 */
class KnexAdapter extends DbAdapter<Knex> {
  constructor(maxRetries = 5, retryDelay = 1000) {
    super(maxRetries, retryDelay);
  }

  /**
   * Creates a new Knex instance with the specified configuration.
   * @returns A new Knex instance.
   */
  protected createInstance(): Knex {
    return knex(environmentConfig);
  }

  /**
   * Tests the Knex database connection.
   * @throws Error if the connection test fails.
   */
  protected async testConnection(): Promise<void> {
    await this.instance!.raw('SELECT 1');
  }

  //!TODO: Check if this method is going to be used anywhere if not delete method
  async createTransaction(): Promise<Knex.Transaction> {
    return this.instance!.transaction();
  }

  /**
   * Executes a raw SQL query using Knex.
   * @param queryString - The SQL query string.
   * @param params - Optional parameters for the SQL query.
   * @returns The result of the SQL query.
   * @throws Error if the Knex instance is not initialized.
   */
  async query(queryString: string, params: any[] = []): Promise<any> {
    if (!this.instance) {
      throw new Error('Knex has not been initialized. Call initialize first.');
    }
    return this.instance.raw(queryString, params);
  }
}

export default KnexAdapter;
