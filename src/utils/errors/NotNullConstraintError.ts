import { DatabaseError } from "./DatabaseError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.NotNullConstraintError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.DatabaseError'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for not-null constraint violations
 *               example: 400
 *             message:
 *               type: string
 *               description: Error message indicating missing required data
 *               example: "Missing required user data"
 *             detail:
 *               type: string
 *               description: Additional details about the not-null constraint violation (optional)
 *           description: Error thrown when a required field is missing from the input.
 */
export class NotNullConstraintError extends DatabaseError {
  constructor(detail?: string) {
    super("Missing required user data", 400, detail);
  }
}
