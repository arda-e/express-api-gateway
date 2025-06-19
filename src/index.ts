import "reflect-metadata";
import dotenvFlow from "dotenv-flow";
import LoggerFactory from "@utils/Logger";

import { startServer } from "./server";

dotenvFlow.config();

(async () => {
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
