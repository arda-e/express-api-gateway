import { Request, Response, NextFunction } from "express";

import { handleControllerError } from "./errorHandlerUtil";

/**
 * Logs the start of a request.
 */
export function logRequestStart(req: Request): void {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | Started`);
}

/**
 * Logs the completion of a request.
 */
export function logRequestEnd(req: Request): void {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | Completed`);
}

/**
 * Future: Handler for benchmarking
 */
export class BenchmarkHandler {
  private startTime: number = 0;

  start(): void {
    this.startTime = performance.now();
  }

  end(req: Request): void {
    const duration = performance.now() - this.startTime;
    console.log(
      `${new Date().toISOString()} | ${req.method} ${req.path} | Duration: ${duration.toFixed(2)}ms`,
    );
  }
}

/**
 * Controller wrapper that applies middleware functions before and after method execution.
 * Returns a function that wraps the original method with the provided handlers.
 */
export function createControllerMethodWrapper(options: {
  errorHandler?: typeof handleControllerError;
  logging?: boolean;
  benchmarking?: boolean;
}) {
  return function wrapControllerMethod(originalMethod: Function, context: any) {
    return async function (...args: any[]) {
      const [req, res, next] = args;
      const benchmark = options.benchmarking ? new BenchmarkHandler() : null;

      try {
        // Pre-execution handlers
        if (options.logging) {
          logRequestStart(req);
        }

        if (benchmark) {
          benchmark.start();
        }

        // Execute the original method
        const result = await originalMethod.apply(context, args);

        // Post-execution handlers
        if (benchmark) {
          benchmark.end(req);
        }

        if (options.logging) {
          logRequestEnd(req);
        }

        return result;
      } catch (error: unknown) {
        // Error handling
        if (options.errorHandler) {
          options.errorHandler(error as Error, req, res, next);
        } else {
          next(error);
        }
      }
    };
  };
}
