import { Request } from "express";
import LoggerFactory from "@utils/Logger";

/**
 * Logs the start of request processing
 */
export function logRequestStart(req: Request): void {
  const logger = LoggerFactory.getLogger();
  logger.info(`${req.method} ${req.path} | Started`);
}

/**
 * Logs the completion of request processing
 */
export function logRequestEnd(req: Request): void {
  const logger = LoggerFactory.getLogger();
  logger.info(`${req.method} ${req.path} | Completed`);
}
