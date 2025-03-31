import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.UniqueConstraintError:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code for unique constraint violations (409 Conflict)
 *           example: 409
 *         message:
 *           type: string
 *           description: Error message describing which field violated the unique constraint
 *           example: "Unique constraint violated on email"
 *         detail:
 *           type: string
 *           description: Additional details about the constraint violation (optional)
 *           example: "The email address is already in use"
 *       description: Error thrown when a database unique constraint is violated (e.g., duplicate email)
 */
export class UniqueConstraintError extends DatabaseError {
  constructor(field: string, detail?: string) {
    super(`Unique constraint violated on ${field}`, 409, detail); // 409 Conflict status code
  }
}
