import { createLogger, format, transports, Logger } from "winston";
import "winston-daily-rotate-file";
import TransportStream from "winston-transport";
import ConfigService from "@config/ConfigService";

class LoggerFactory {
  private static instance: Logger | null = null;

  private static createAsyncLogger(): Logger {
    const transportList: TransportStream[] = [
      new transports.Console({ handleExceptions: true }),
      new transports.DailyRotateFile({
        filename: ConfigService.values.LOG_FILE_PATH ?? "app-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        handleExceptions: true,
      }),
    ];

    if (ConfigService.analytics.enabled && ConfigService.analytics.url) {
      const analyticsUrl = new URL(ConfigService.analytics.url);
      transportList.push(
        new transports.Http({
          level: ConfigService.analytics.logLevel,
          host: analyticsUrl.hostname,
          port: Number(analyticsUrl.port) || (analyticsUrl.protocol === "https:" ? 443 : 80),
          path: analyticsUrl.pathname,
          ssl: analyticsUrl.protocol === "https:",
          handleExceptions: true,
        }) as unknown as TransportStream,
      );
    }

    return createLogger({
      level: ConfigService.values.LOG_LEVEL ?? "info",
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
