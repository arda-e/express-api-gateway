import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors/AppError';
import Logger from '@utils/Logger';

const logger = Logger.getLogger();

/**
 * Middleware function to handle errors in the application.
 *
 * This middleware function is responsible for logging errors and sending appropriate
 * error responses to the client. It handles both custom `AppError` instances and
 * unhandled errors.
 *
 * For `AppError` instances, it sends a JSON response with the error status code,
 * status, and message. For unhandled errors, it sends a 500 Internal Server Error
 * response with a generic error message.
 *
 * @param err - The error object that was thrown.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    headers: req.headers,
    params: req.params,
    body: req.body,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // For unhandled errors
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error',
  });
};

export default errorHandler;
