import { AppError } from "@utils/errors/AppError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.AuthenticationError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.ErrorResponse'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for authentication errors
 *               example: 401
 *             message:
 *               type: string
 *               description: Error message describing the authentication failure
 *               example: "Authentication failed"
 *           description: Error thrown when authentication fails (invalid credentials, expired tokens, etc.)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}
