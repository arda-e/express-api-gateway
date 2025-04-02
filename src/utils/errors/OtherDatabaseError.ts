import { StatusCodes } from "http-status-codes";

import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     common.OtherDatabaseError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "OtherDatabaseError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code (500 Internal Server Error)
 *         message:
 *           type: string
 *           description: Description of the database error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: Error thrown for less common DB errors (e.g., serialization failures, invalid catalogs, internal errors).
 */
export class OtherDatabaseError extends DatabaseError {
  constructor(message: string, detail?: string) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
