//** EXTERNAL LIBRARIES
import { container } from "tsyringe";
//** INTERNAL UTILS
import { RedisManager } from "@utils/RedisManager";
import DatabaseFactory from "@db/db.manager";
import LoggerFactory from "@utils/Logger";
import DatabaseManager from "@db/db.manager";
import { AuthRepository, AuthService } from "@api/v1/auth";
import { EventQueue } from "@utils/queue/EventQueue";
import { DeadLetterQueue } from "@utils/queue/DeadLetterQueue";
import QueueService from "@api/v1/queue/queue.service";
import QueueController from "@api/v1/queue/queue.controller";

import SessionConfig from "./sessionConfig";

const logger = LoggerFactory.getLogger();

export const initializeServerDependencies = async (
  sessionManager: SessionConfig = container.resolve(SessionConfig),
  databaseFactory: DatabaseFactory = container.resolve(DatabaseFactory),
): Promise<void> => {
  try {
    const redisManager = container.resolve(RedisManager);
    await redisManager.initialize();
    logger.info("Redis initialized");

    // Initialize session middleware with injected or default session manager
    sessionManager.getSessionMiddleware();
    logger.info("Session middleware initialized");
    // Initialize database with injected or default database factory
    await databaseFactory.createDatabase();
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to initialize dependencies: ${error.message}`);
    } else {
      logger.error("Failed to initialize dependencies: Unknown error");
    }
    throw error;
  }
};

export const initializeAppDependencies = (): void => {
  try {
    logger.info("Initializing application dependencies...");
    // Register EventQueue with RedisManager dependency
    container.register(EventQueue, {
      useFactory: (container) => {
        const redisManager = container.resolve(RedisManager);
        return new EventQueue(redisManager);
      },
    });
    // Register DeadLetterQueue with RedisManager dependency
    container.register(DeadLetterQueue, {
      useFactory: (container) => {
        const redisManager = container.resolve(RedisManager);
        return new DeadLetterQueue(redisManager);
      },
    });
    // Register QueueService
    container.register(QueueService, {
      useClass: QueueService,
    });
    // Register QueueController
    container.register(QueueController, {
      useClass: QueueController,
    });
    container.resolve(DatabaseManager);
    container.resolve(AuthRepository);
    container.resolve(AuthService);
    logger.info("Application dependencies initialized successfully.");
  } catch (error) {
    logger.error("Failed to initialize application dependencies:", error);
    throw error; // Ensure fatal errors propagate
  }
};
