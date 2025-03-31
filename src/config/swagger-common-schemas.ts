/**
 * @swagger
 * components:
 *   schemas:
 *     common.SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *         statusCode:
 *           type: integer
 *         data:
 *           type: object
 *
 *     common.ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *         statusCode:
 *           type: integer
 *           description: HTTP status code for the error
 *         detail:
 *           type: string
 *           description: Additional details about the error (optional)
 *       required:
 *         - status
 *         - message
 *         - statusCode
 *       example:
 *         status: error
 *         message: An error occurred while processing your request
 *         statusCode: 400
 */
