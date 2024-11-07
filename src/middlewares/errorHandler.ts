import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors/AppError';
import Logger from '@utils/Logger';
import { StatusCodes } from 'http-status-codes';

const logger = Logger.getLogger();

/**
 * Checks if a user is authenticated based on the session information in the request.
 *
 * @param {Request} req - The request object containing session details.
 * @return {boolean} True if the user is authenticated, false otherwise.
 */
function isUserAuthenticated(req: Request): boolean {
  return !!(req.session && req.session.userId);
}

/**
 * Middleware function to handle errors in the application.
 *
 * Logs detailed error information including the request method, URL, headers, parameters, and body.
 * Differentiates between user authentication errors, application-specific errors, and general errors,
 * and responds with appropriate HTTP status codes and messages.
 *
 * @param {Error} err - The error object that was thrown.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('ErrorHandler: Received error:', err);

  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    headers: req.headers,
    params: req.params,
    body: req.body,
  });

  console.log('Error in errorHandler:', err);

  if (!isUserAuthenticated(req)) {
    //!TODO: Use response builder
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized',
    });
  }

  if (err instanceof AppError) {
    console.log('ErrorHandler: Handling AppError');
    //!TODO: Use response builder
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  console.log('ErrorHandler: Unhandled error type');
  //!TODO: Use response builder
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error',
  });
};

export default errorHandler;
