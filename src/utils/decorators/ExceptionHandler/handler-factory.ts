import * as Errors from "@utils/errors";
import { StatusCodes } from "http-status-codes";

import { PostgresErrorConfig } from "./config";
import { DEFAULT_PASSTHROUGH_ERRORS } from "./passthrough-errors";
import { DEFAULT_CODE_MAP } from "./postgres-error-map";

export function createHandleDatabaseError(config?: PostgresErrorConfig) {
  const passThrough = config?.passThroughErrors ?? DEFAULT_PASSTHROUGH_ERRORS;
  const codeMap = { ...DEFAULT_CODE_MAP, ...config?.codeMap };
  const shouldLog = config?.enableLogging ?? false;

  function isPassthroughError(error: unknown): boolean {
    return passThrough.some((ErrorType) => error instanceof ErrorType);
  }

  function convertOrWrap(error: any, customMessage?: string): never {
    if (isPassthroughError(error)) {
      throw error;
    }

    if (error.code) {
      const factory = codeMap[error.code];
      if (factory) {
        throw factory(error);
      }
      throw new Errors.OtherDatabaseError(
        `Unmapped Postgres error (${error.code}): ${error.message}`,
      );
    }

    if (customMessage) {
      throw new Errors.DatabaseError(
        `${customMessage}: ${error?.message ?? "Unknown error"}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.detail,
      );
    }

    throw new Errors.OtherDbFallbackError("Unexpected database error", error.detail);
  }

  return function handleDatabaseError(error: any, customMessage?: string): never {
    if (shouldLog) {
      console.error("[Database Error]", error);
    }
    convertOrWrap(error, customMessage);
  };
}
