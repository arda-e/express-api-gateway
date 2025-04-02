import { Request } from "express";

/**
 * Logs the start of request processing
 */
export function logRequestStart(req: Request): void {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | Started`);
}

/**
 * Logs the completion of request processing
 */
export function logRequestEnd(req: Request): void {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | Completed`);
}
