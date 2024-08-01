import { Database } from './db.interface';
import Logger from '@utils/Logger';

const logger = Logger.getLogger();

/**
 * Abstract base class for database adapters.
 * Provides common functionality for initializing and managing database connections.
 */
abstract class DbAdapter<T> implements Database {

    protected maxRetries: number;
    protected retryDelay: number;
    protected instance: T | null = null;

    protected constructor(maxRetries = 5, retryDelay = 1000) {
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }


    protected abstract createInstance(): T;
    protected abstract testConnection(): Promise<void>;
    /**
     * Method to execute a query on the database.
     * Must be implemented by subclasses.
     */
    abstract query(queryString: string, params?: any[]): Promise<any>;

    /**
     * Initializes the database connection with retry logic.
     */
    async initialize(): Promise<void> {
        let retries = 0;
        const attemptConnection = async (): Promise<void> => {
            try {
                this.instance = this.createInstance();
                await this.testConnection();
                logger.info('Database connection established.');
            } catch (error) {
                this.handleConnectionError(error, retries);
                retries += 1;
                if (retries < this.maxRetries) {
                    await this.delayRetry();
                    return attemptConnection();
                } else {
                    logger.error('Max retries reached. Could not establish a database connection.');
                    throw new Error('Could not connect to the database.');
                }
            }
        };

        await attemptConnection();
    }

    /**
     * Returns the initialized database instance.
     * @throws Error if the database is not initialized.
     */
    getInstance(): T {
        if (!this.instance) {
            throw new Error('Database has not been initialized. Call initialize first.');
        }
        return this.instance;
    }

    /**
     * Closes the database connection.
     */
    async close(): Promise<void> {
        const instance = this.getInstance();
        if (instance && typeof (instance as any).destroy === 'function') {
            await (instance as any).destroy();
        }
    }

    /**
     * Delays retry attempts.
     * @returns A promise that resolves after the specified retry delay.
     */
    protected delayRetry(): Promise<void> {
        return new Promise((res) => setTimeout(res, this.retryDelay));
    }

    /**
     * Handles connection errors and logs retry attempts.
     * @param error - The error that occurred during connection attempt.
     * @param retries - The current number of retry attempts.
     */
    protected handleConnectionError(error: unknown, retries: number): void {
        if (error instanceof Error) {
            logger.error(`Database connection failed (attempt ${retries + 1}): ${error.message}`);
        } else {
            logger.error(`Database connection failed (attempt ${retries + 1}): Unknown error`);
        }
        logger.info(`Retrying to connect to the database in ${this.retryDelay / 1000} seconds...`);
    }
}

export default DbAdapter;
