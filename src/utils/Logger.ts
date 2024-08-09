import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

class LoggerFactory {
  private static instance: Logger | null = null;

  private static createAsyncLogger(): Logger {
    return createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.Console({
          handleExceptions: true,
        }),
        new transports.DailyRotateFile({
          filename: process.env.LOG_FILE_PATH || 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          handleExceptions: true,
        }),
      ],
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
