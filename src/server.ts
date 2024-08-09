import { Server } from 'http';
import LoggerFactory from '@utils/Logger';
import { initializeDependencies } from '@config/dependencies';
import SessionConfig from '@config/sessionConfig';
import Config from '@config/config';

import DbFactory from './db/db.factory';
import DatabaseFactory from './db/db.factory';

const logger = LoggerFactory.getLogger();

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
const startServer = async (): Promise<void> => {
  try {
    await initializeDependencies(SessionConfig, DatabaseFactory);

    const { default: app } = await import('./app');

    const server: Server = app.listen(Config.server.port, () => {
      logger.info(`API Gateway running on port ${Config.server.port}`);
    });

    process.on('SIGTERM', () => gracefulShutdown(SessionConfig, DatabaseFactory, server));
    process.on('SIGINT', () => gracefulShutdown(SessionConfig, DatabaseFactory, server));
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Gracefully shuts down the server and associated resources.
 *
 * This function is responsible for closing the server, destroying the session
 * configuration, and closing the database connection. It uses a race condition
 * to ensure the shutdown completes within a configured timeout.
 *
 * @param SessionConfig - The session configuration module.
 * @param DatabaseFactory - The database factory module.
 * @param server - The HTTP server instance to be closed.
 * @returns A Promise that resolves when the shutdown is complete.
 */
async function gracefulShutdown(
  SessionConfig: typeof SessionConfig,
  DatabaseFactory: typeof DatabaseFactory,
  server: Server,
): Promise<void> {
  logger.info('Graceful shutdown initiated');
  async function handleServerClose(): Promise<void> {
    return new Promise<void>((resolve) => {
      server.close(async () => {
        await new SessionConfig.destroyInstance();
        const db = DbFactory.getDatabase();
        await db.close();
        resolve();
      });
    });
  }

  try {
    // Wait for either the server to close or the timeout to occur.
    await Promise.race([
      handleServerClose(),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Shutdown timeout')), Config.server.shutdownTimeout),
      ),
    ]);
    logger.info('Server closed successfully');
  } catch (error) {
    logger.error(`Error during graceful shutdown: ${error.message}`);
  } finally {
    process.exit(0);
  }
}

export { startServer };
