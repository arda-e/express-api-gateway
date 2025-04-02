import { StatusCodes } from "http-status-codes";

import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     common.SyntaxOrReferenceError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "SyntaxOrReferenceError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code (400 Bad Request)
 *         message:
 *           type: string
 *           description: Description of the SQL syntax or reference error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: Error thrown for SQL syntax, referencing undefined columns/tables/functions (PG codes 42601, 42703, 42P01, 42883).
 */
export class SyntaxOrReferenceError extends DatabaseError {
  constructor(message: string, detail?: string) {
    super(message, StatusCodes.BAD_REQUEST, detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
