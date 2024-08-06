import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';

/**
 * Provides a logger factory that creates a Winston logger instance with different configurations for development and production environments.
 *
 * The logger factory creates a singleton instance of the Winston logger and provides a static method to retrieve it.
 *
 * In development, the logger is configured to log debug-level messages to the console and a debug log file.
 * In production, the logger is configured to log info-level messages to the console, an info log file, and an error log file.
 */
class LoggerFactory {
  private static instance: Logger | null = null;

  private static createDevLogger(): Logger {
    return createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
      ),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          filename: process.env.LOG_FILE_PATH || 'app-debug-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'debug',
          handleExceptions: true,
        }),
      ],
    });
  }

  private static createProdLogger(): Logger {
    return createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          filename: process.env.LOG_FILE_PATH || 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          handleExceptions: true,
        }),
        new transports.DailyRotateFile({
          filename: process.env.ERROR_LOG_FILE_PATH || 'app-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          handleExceptions: true,
        }),
      ],
    });
  }

  /**
   * Retrieves the singleton instance of the Winston logger, creating it if necessary.
   *
   * The logger instance is created with different configurations for development and production environments.
   *
   * @returns {Logger} The singleton instance of the Winston logger.
   */
  public static getLogger(): Logger {
    if (!this.instance) {
      if (process.env.NODE_ENV === 'production') {
        this.instance = this.createProdLogger();
      } else {
        this.instance = this.createDevLogger();
      }
    }
    return this.instance;
  }
}

export default LoggerFactory;
