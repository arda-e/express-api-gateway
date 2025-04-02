import { StatusCodes } from "http-status-codes";

import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     common.DatabaseAuthError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "DatabaseAuthError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code (403 Forbidden)
 *         message:
 *           type: string
 *           description: Description of the database authentication error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: Error thrown for permission/auth errors (PG codes 28000, 42501).
 */
export class DatabaseAuthError extends DatabaseError {
  constructor(message: string, detail?: string) {
    super(message, StatusCodes.FORBIDDEN, detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
