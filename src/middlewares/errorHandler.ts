import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

const logger = Logger.getLogger();

/**
 * Middleware function to handle errors in the application.
 *
 * This middleware function is responsible for logging errors that occur in the application and sending a JSON response with the error message.
 *
 * @param err - The error object that was thrown.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${req.method} ${req.url} - ${err.message}`);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};

export default errorHandler;