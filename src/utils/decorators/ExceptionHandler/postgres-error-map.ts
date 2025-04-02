import * as Errors from "@utils/errors";

import { extractFieldNameFromDetail } from "./extract-field";

export const DEFAULT_CODE_MAP: Record<string, (error: any) => Error> = {
  "23505": (error) => {
    const field = extractFieldNameFromDetail(error.detail) || "unknown field";
    return new Errors.UniqueConstraintError(field, error.detail);
  },
  "23503": () => new Errors.ForeignKeyViolationError("Invalid foreign key reference"),
  "23502": () => new Errors.NotNullConstraintError("Missing required field"),
  "23514": () => new Errors.CheckViolationError("Check constraint failed"),
  "42601": (error) => new Errors.SyntaxOrReferenceError(`SQL syntax error: ${error.message}`),
  "42703": (error) => new Errors.SyntaxOrReferenceError(`Undefined column: ${error.message}`),
  "42P01": (error) => new Errors.SyntaxOrReferenceError(`Undefined table: ${error.message}`),
  "42883": (error) => new Errors.SyntaxOrReferenceError(`Undefined function: ${error.message}`),
  "22P02": (error) => new Errors.DataFormatError(`Invalid data format: ${error.message}`),
  "22003": (error) => new Errors.DataFormatError(`Numeric value out of range: ${error.message}`),
  "28000": (error) => new Errors.DatabaseAuthError(`Invalid authorization: ${error.message}`),
  "42501": (error) => new Errors.DatabaseAuthError(`Insufficient privilege: ${error.message}`),
};
