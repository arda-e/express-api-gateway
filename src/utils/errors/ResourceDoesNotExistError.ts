import { AppError } from "@utils/errors/AppError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.ResourceDoesNotExistError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.ErrorResponse'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for resource not found errors
 *               example: 404
 *             message:
 *               type: string
 *               description: Error message describing which resource could not be found
 *               example: "Resource does not exist"
 *           description: Error thrown when a requested resource cannot be found in the database
 */
export class ResourceDoesNotExistError extends AppError {
  constructor(message: string = "Resource does not exist") {
    super(404, message);
  }
}
