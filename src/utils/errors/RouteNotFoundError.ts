import { AppError } from "@utils/errors/AppError";

/**
 * @swagger
 * components:
 *   schemas:
 *     error.RouteNotFoundError:
 *       allOf:
 *         - $ref: '#/components/schemas/common.ErrorResponse'
 *         - type: object
 *           properties:
 *             statusCode:
 *               type: integer
 *               description: HTTP status code for route not found errors
 *               example: 404
 *             message:
 *               type: string
 *               description: Error message indicating that the route was not found
 *               example: "Route not found"
 *           description: Error thrown when an API endpoint is not found.
 */
export class RouteNotFoundError extends AppError {
  constructor(message: string = "Route not found") {
    super(message, 404, "ROUTE_NOT_FOUND");
  }
}
