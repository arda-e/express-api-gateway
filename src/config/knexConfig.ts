import knex, { Knex } from "knex";
import knexConfig from "./knexfile";
import Logger from "../utils/Logger";
const environment = process.env.NODE_ENV || "development";
const environmentConfig = knexConfig[environment];

const logger = Logger.getLogger();

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // in milliseconds

let knexInstance: Knex;

/**
 * Initializes the Knex database connection, with automatic retries on connection failure.
 *
 * This function will attempt to connect to the database, and if the connection fails, it will
 * retry up to `MAX_RETRIES` times, with a delay of `RETRY_DELAY` milliseconds between each
 * attempt.
 *
 * If the maximum number of retries is reached and a connection still cannot be established,
 * an error will be thrown.
 *
 * @returns {Promise<Knex>} The initialized Knex database connection instance.
 * @throws {Error} If the maximum number of retries is reached and a connection still cannot be established.
 */
const initializeKnex = async (): Promise<Knex> => {
    let retries = 0;

    const attemptConnection = async (): Promise<Knex> => {
        try {
            const knexInstance = knex(environmentConfig);
            await knexInstance.raw("SELECT 1");
            logger.info("Knex - Database connection established.");
            return knexInstance;
        } catch (error) {
            handleConnectionError(error, retries);
            retries += 1;
            if (retries < MAX_RETRIES) {
                await delayRetry();
                return attemptConnection();
            } else {
                logger.error("Max retries reached. Could not establish a database connection.");
                throw new Error('Could not connect to the database.');
            }
        }
    };

    return attemptConnection();
}

const delayRetry = (): Promise<void> => {
    return new Promise((res) => setTimeout(res, RETRY_DELAY));
};

const handleConnectionError = (error: unknown, retries: number): void => {
    if (error instanceof Error) {
        console.error(`Database connection failed (attempt ${retries + 1}): ${error.message}`);
    } else {
        console.error(`Database connection failed (attempt ${retries + 1}): Unknown error`);
    }
    console.info(`Retrying to connect to the database in ${RETRY_DELAY / 1000} seconds...`);
};

/**
 * Returns the singleton instance of the Knex database connection.
 *
 * This function should only be called after `initializeKnex()` has been called to
 * initialize the Knex connection.
 *
 * @returns {Knex} The Knex database connection instance.
 * @throws {Error} If `initializeKnex()` has not been called yet.
 */
const getKnexInstance = (): Knex => {
    if (!knexInstance) {
        throw new Error('Knex has not been initialized. Call initializeKnex first.');
    }
    return knexInstance;
};

export { initializeKnex, getKnexInstance };