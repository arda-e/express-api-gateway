import { StatusCodes } from "http-status-codes";

import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     common.CheckViolationError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "CheckViolationError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code (400 Bad Request)
 *         message:
 *           type: string
 *           description: Description of the check constraint violation
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: Error thrown when a check constraint fails (PG code 23514).
 */
export class CheckViolationError extends DatabaseError {
  constructor(message: string, detail?: string) {
    super(message, StatusCodes.BAD_REQUEST, detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
