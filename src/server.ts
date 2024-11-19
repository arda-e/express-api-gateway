import { Server } from 'http';
import { container } from 'tsyringe';
import LoggerFactory from '@utils/Logger';
import Config from '@config/config';
import { initializeServerDependencies } from '@config/dependencies';
import SessionConfig from '@config/sessionConfig';

import DatabaseManager from './db/db.manager';

const logger = LoggerFactory.getLogger();
const SERVER_PORT = Config.server.port;
const SHUTDOWN_TIMEOUT = Config.server.shutdownTimeout;

enum SHUTDOWN_EVENTS {
  SIGINT = 'SIGINT',
  SIGTERM = 'SIGTERM',
  UNCAUGHT_EXCEPTION = 'uncaughtException',
}

/**
 * Starts the server and sets up event listeners for graceful shutdown and uncaught exceptions.
 *
 * This function initializes the dependencies, imports the main application, starts the server,
 * and sets up event listeners for SIGTERM, SIGINT, and uncaught exceptions. When a shutdown
 * signal is received or an uncaught exception occurs, the `gracefulShutdown` function is
 * called to gracefully shut down the server and associated resources.
 *
 * @returns A Promise that resolves when the server is started and running.
 */
const startServer = async (
  sessionConfig: SessionConfig = container.resolve(SessionConfig),
  databaseFactory: DatabaseManager = container.resolve(DatabaseManager),
): Promise<Server> => {
  try {
    await initializeServerDependencies(sessionConfig, databaseFactory);
    const { default: app } = await import('./app');

    const server: Server = app.listen(SERVER_PORT, () => {
      logger.info(`API Gateway running on port ${SERVER_PORT}`);
    });

    setupEventListeners(server);

    return server;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to start server: ${error.message}`);
    } else {
      logger.error(`Failed to start server: ${String(error)}`);
    }
    process.exit(1);
  }
};

/**
 * Sets up event listeners for SIGTERM, SIGINT, and uncaught exceptions.
 *
 * @param server - The HTTP server instance.
 */
function setupEventListeners(server: Server): void {
  process.on(SHUTDOWN_EVENTS.SIGINT, () => gracefulShutdown(server));
  process.on(SHUTDOWN_EVENTS.SIGTERM, () => gracefulShutdown(server));
  process.on(SHUTDOWN_EVENTS.UNCAUGHT_EXCEPTION, handleUncaughtException);
}

/**
 * Handles uncaught exceptions by logging the error and exiting the process.
 *
 * @param error - The error that was thrown.
 */
function handleUncaughtException(error: Error): void {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
}

/**
 * Gracefully shuts down the server and associated resources.
 *
 * This function is responsible for closing the server, destroying the session
 * configuration, and closing the database connection. It uses a race condition
 * to ensure the shutdown completes within a configured timeout.
 *
 * @param server - The HTTP server instance to be closed.
 * @returns A Promise that resolves when the shutdown is complete.
 */
export async function gracefulShutdown(server: Server): Promise<void> {
  logger.info('Graceful shutdown initiated');
  try {
    // Wait for either the server to close or the timeout to occur.
    await Promise.race([
      handleServerClose(server),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Shutdown timeout')), SHUTDOWN_TIMEOUT),
      ),
    ]);
    logger.info('Server closed successfully');
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error during graceful shutdown: ${error.message}`);
    } else {
      logger.error('Error during graceful shutdown: Unknown error');
    }
  } finally {
    process.exit(0);
  }
}

export async function handleServerClose(
  server: Server,
  sessionConfig: SessionConfig = container.resolve(SessionConfig),
  databaseManager: DatabaseManager = container.resolve(DatabaseManager),
): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          logger.error('Error closing the server:', error);
          return reject(error);
        }
        logger.info('Server closed successfully.');
        resolve();
      });
    });

    await sessionConfig.destroy();
    logger.info('Session configuration destroyed.');

    // Close the database connection
    await databaseManager.close();
    logger.info('Database connection closed.');
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
  }
}

export { startServer };
