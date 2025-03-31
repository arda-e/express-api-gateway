import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.ForeignKeyViolationError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.DatabaseError'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for foreign key violations
 *               example: 400
 *             message:
 *               type: string
 *               description: Error message describing the foreign key violation
 *               example: "Foreign key violation"
 *             detail:
 *               type: string
 *               description: Additional details about the violation (optional)
 *           description: Error thrown when a foreign key constraint is violated in the database.
 */
export class ForeignKeyViolationError extends DatabaseError {
  constructor(detail?: string) {
    super("Foreign key violation", 400, detail);
  }
}
