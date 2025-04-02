import { NextFunction, Request, Response } from "express";

import { logRequestStart, logRequestEnd } from "./logging";
import { handleResponse } from "./response-handler";
import { BenchmarkManager } from "../common/BenchmarkManager";

/**
 * Creates a wrapper function for controller methods
 */
export function createMethodWrapper(
  originalMethod: Function,
  methodName: string,
  shouldBenchmark: boolean,
  shouldLog: boolean,
): (req: Request, res: Response, next: NextFunction) => Promise<any> {
  return async function (this: any, req: Request, res: Response, next: NextFunction) {
    try {
      // Pre-execution logging
      if (shouldLog) logRequestStart(req);

      const benchmarkManager = new BenchmarkManager().start();

      // Execute the original method
      const result = await originalMethod.apply(this, [req, res, next]);

      // Handle response formatting
      handleResponse(result, res);

      // Benchmarking end
      if (shouldBenchmark) benchmarkManager.end(methodName);

      // Post-execution logging
      if (shouldLog) logRequestEnd(req);

      return result;
    } catch (error: unknown) {
      // Pass to next middleware (global error handler)
      next(error);
    }
  };
}
