import { StatusCodes } from "http-status-codes";

import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     common.DataFormatError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "DataFormatError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code (400 Bad Request)
 *         message:
 *           type: string
 *           description: Description of the data format error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: Error thrown for invalid text representations or numeric out-of-range issues (PG codes 22P02, 22003).
 */
export class DataFormatError extends DatabaseError {
  constructor(message: string, detail?: string) {
    super(message, StatusCodes.BAD_REQUEST, detail);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
