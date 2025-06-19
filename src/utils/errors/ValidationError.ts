import { AppError } from "@utils/errors/AppError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.ValidationError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.ErrorResponse'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for validation errors
 *               example: 400
 *             message:
 *               type: string
 *               description: Error message indicating validation failure
 *               example: "Validation failed"
 *           description: Error thrown when input validation fails.
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
