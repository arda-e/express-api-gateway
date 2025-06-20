import { createLogger, format, transports, Logger } from "winston";
import "winston-daily-rotate-file";
import TransportStream from "winston-transport";

/**
 * Provides a singleton logger factory for creating and managing a Winston logger instance.
 * Configures logging with console and file transports, supporting environment-based log levels.
 */
class LoggerFactory {
  private static instance: Logger | null = null;

  /**
   * Creates an asynchronous logger instance with console and daily rotate file transports.
   * Configures logging level from environment, adds timestamp, and uses JSON format.
   * @returns {Logger} A configured Winston logger instance
   * @private
   * */
  private static createAsyncLogger(): Logger {
    const transportList: TransportStream[] = [
      new transports.Console({
        handleExceptions: true,
      }),
      new transports.DailyRotateFile({
        filename: process.env.LOG_FILE_PATH || "app-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        handleExceptions: true,
      }),
    ];

    if (process.env.ANALYTICS_ENABLED === "true" && process.env.ANALYTICS_URL) {
      const analyticsUrl = new URL(process.env.ANALYTICS_URL);
      transportList.push(
        new transports.Http({
          level: process.env.ANALYTICS_LOG_LEVEL || "info",
          host: analyticsUrl.hostname,
          port: Number(analyticsUrl.port) || (analyticsUrl.protocol === "https:" ? 443 : 80),
          path: analyticsUrl.pathname,
          ssl: analyticsUrl.protocol === "https:",
          handleExceptions: true,
        }) as unknown as TransportStream,
      );
    }

    return createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: format.combine(format.timestamp(), format.json()),
      transports: transportList,
    });
  }

  public static getLogger(): Logger {
    if (!this.instance) {
      this.instance = this.createAsyncLogger();
    }
    return this.instance;
  }
}

export default LoggerFactory;
