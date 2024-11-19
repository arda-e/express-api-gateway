//** EXTERNAL LIBRARIES
import { singleton } from 'tsyringe';
//** INTERNAL UTILS
import Logger from '@utils/Logger';
import Config from '@config/config';

//** INTERNAL MODULES
import KnexAdapter from './knex.adapter';
import { Database } from './db.interface';
//** CONSTANTS
const MAX_RETRIES = Config.db.maxRetries;
const RETRY_DELAY = Config.db.retryDelay;

enum DatabaseState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR',
  CLOSED = 'CLOSED',
}

/**
 * DatabaseFactory is a singleton class responsible for creating and managing
 * a single instance of the database connection adapter. The adapter class is
 * provided through dependency injection and configured with retry logic for
 * establishing a connection.
 *
 * @singleton
 */
@singleton()
class DatabaseManager {
  private instance: Database | null = null;
  private logger = Logger.getLogger();
  private state: DatabaseState = DatabaseState.UNINITIALIZED;
  private initializationError: Error | null = null;

  constructor(
    private maxRetries: number = MAX_RETRIES,
    private retryDelay: number = RETRY_DELAY,
  ) {}

  /**
   * Creates the database instance if it doesn't exist and returns it.
   *
   * Initializes the database connection adapter with retry settings. If the
   * connection fails, it will attempt to reconnect based on retry configuration.
   *
   * @returns {Database} The database connection instance.
   * @throws {Error} If the database initialization fails.
   */
  public async createDatabase(
    AdapterClass: new (maxRetries: number, retryDelay: number) => Database = KnexAdapter,
  ) {
    if (this.state === DatabaseState.READY && this.instance) {
      return this.instance;
    }

    switch (this.state) {
      case DatabaseState.UNINITIALIZED:
        return await this.initializeDatabase(AdapterClass);

      case DatabaseState.INITIALIZING:
        // Wait for initialization if already in progress
        return await this.waitForInitialization();

      case DatabaseState.READY:
        // Database is ready, return the instance
        return this.instance!;

      case DatabaseState.ERROR:
        // Throw the initialization error if in ERROR state
        throw this.initializationError || new Error('Database initialization failed');

      case DatabaseState.CLOSED:
        // If closed, attempt re-initialization
        this.state = DatabaseState.UNINITIALIZED;
        return await this.initializeDatabase(AdapterClass);

      default:
        throw new Error('Unknown database state');
    }
  }

  private async initializeDatabase(
    AdapterClass: new (maxRetries: number, retryDelay: number) => Database,
  ): Promise<Database> {
    this.state = DatabaseState.INITIALIZING;
    try {
      const dbInstance = new AdapterClass(this.maxRetries, this.retryDelay);
      await dbInstance.initialize(); // Assuming initialize is an async method on the adapter
      this.instance = dbInstance;
      this.state = DatabaseState.READY;
      return this.instance;
    } catch (error) {
      this.state = DatabaseState.ERROR;
      this.initializationError = error as Error;
      throw new Error(`Database initialization failed: ${(error as Error).message}`);
    }
  }

  private async waitForInitialization(): Promise<Database> {
    // Loop until initialization completes or fails
    while (this.state === DatabaseState.INITIALIZING) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait briefly
    }

    if (this.state === DatabaseState.READY && this.instance) {
      return this.instance;
    }

    throw this.initializationError || new Error('Database initialization failed');
  }

  /**
   * Gets the existing database instance or throws an error if it hasn't been created yet.
   *
   * @returns {Database} The database connection instance.
   * @throws {Error} If the database instance has not been created.
   */
  public getDatabase(): Database {
    if (this.state !== DatabaseState.READY || this.instance === null) {
      throw new Error('Database instance has not been created yet.');
    }
    return this.instance;
  }

  /**
   * Closes the database connection.
   */
  public async close(): Promise<void> {
    if (this.instance) {
      this.logger.info('Closing database connection');
      await this.instance.close();
      this.instance = null;
      this.state = DatabaseState.CLOSED;
    }
  }

  //!TODO: Check if its going to be used anywhere and delete method if not required
  public getInitializationError(): Error | null {
    return this.initializationError;
  }
}

export default DatabaseManager;
