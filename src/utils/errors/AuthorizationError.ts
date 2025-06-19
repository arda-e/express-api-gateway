import { AppError } from "@utils/errors/AppError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.AuthorizationError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.ErrorResponse'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for authorization errors
 *               example: 403
 *             message:
 *               type: string
 *               description: Error message describing the lack of permission
 *               example: "Not authorized"
 *           description: Error thrown when a user attempts to access a resource or perform an action they are not permitted to.
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
