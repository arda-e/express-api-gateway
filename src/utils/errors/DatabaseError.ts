/**
 * @swagger
 * components:
 *   schemas:
 *     common.DatabaseError:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "DatabaseError"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code associated with the database error
 *         message:
 *           type: string
 *           description: Description of the database error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       description: Base error for database-related failures.
 */
export class DatabaseError extends Error {
  public statusCode: number;
  public detail?: string;

  constructor(message: string, statusCode: number, detail?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}
