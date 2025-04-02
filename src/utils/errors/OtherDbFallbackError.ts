import { StatusCodes } from "http-status-codes";

import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     common.OtherDbFallbackError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "OtherDbFallbackError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code (500 Internal Server Error)
 *         message:
 *           type: string
 *           description: Description of the generic database error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: A generic or fallback database error class if none of the specific error types apply.
 */
export class OtherDbFallbackError extends DatabaseError {
  constructor(message: string, detail?: string) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
