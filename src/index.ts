import "reflect-metadata";
import LoggerFactory from "@utils/Logger";
import ConfigService from "@config/ConfigService";

import { startServer } from "./server";

(async () => {
  ConfigService.load();
  const logger = LoggerFactory.getLogger();
  logger.info("Starting server...");
  try {
    await startServer();
    logger.info("Server started successfully.");
  } catch (error) {
    logger.error("Failed to start the server:", error);
    process.exit(1);
  }
})();
