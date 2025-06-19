import "reflect-metadata";
import dotenvFlow from "dotenv-flow";

import { startServer } from "./server";

dotenvFlow.config();

(async () => {
  console.log("Starting server...");
  try {
    await startServer();
    console.log("Server started successfully.");
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
})();
