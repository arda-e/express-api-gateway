import { AppError } from "@utils/errors/AppError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.ResourceAlreadyExistsError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.ErrorResponse'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for resource already exists errors
 *               example: 409
 *             message:
 *               type: string
 *               description: Error message indicating the resource already exists
 *               example: "Resource already exists"
 *           description: Error thrown when attempting to create a resource that already exists.
 */
export class ResourceAlreadyExistsError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(409, message);
  }
}
