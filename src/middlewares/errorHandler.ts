import { Request, Response, NextFunction } from 'express';
import Logger from '@utils/Logger';
import {ResponseFactory} from "@utils/responses/ResponseFactory";
import {ErrorResponse} from "@utils/responses/error/ErrorResponse";
import {ErrorType} from "@utils/errors/ErrorTypes";


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
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    logger.error(`${req.method} ${req.url} - ${err.message}`, {
        stack: err.stack,
        headers: req.headers,
        params: req.params,
        body: req.body
    });

    let status: number
    let response: ErrorResponse

    switch (err.name) {
        case ErrorType.BAD_REQUEST:
            [status,response] = ResponseFactory.createBadRequestResponse(err.message);
            res.status(status).json(response);
            break;
        case ErrorType.ROUTE_NOT_FOUND:
            [status,response] = ResponseFactory.createNotFoundResponse(err.message);
            res.status(status).json(response);
            break;
        case ErrorType.UNAUTHORIZED:
            [status,response] =ResponseFactory.createUnauthorizedResponse()
            res.status(status).json(response);
            break;
        case ErrorType.RESOURCE_DOES_NOT_EXIST:
            [status,response] = ResponseFactory.createNotFoundResponse(err.message);
            res.status(status).json(response);
            break;
        case ErrorType.VALIDATION:
            break;
        case ErrorType.INTERNAL_SERVER:
        default:
            [status,response] = ResponseFactory.createInternalServerErrorResponse(err.message);
            res.status(status).json(response);
            break;
    }
};

export default errorHandler;