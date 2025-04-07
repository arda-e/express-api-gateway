//** EXTERNAL LIBRARIES
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
//** INTERNAL UTILS
import Logger from "@utils/Logger";
import { AppError } from "@utils/errors/AppError";
import { ResponseBuilder } from "@utils/ResponseBuilder";

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
 */
const errorHandler = (err: Error, req: Request, res: Response) => {
  //** SERVER LOG
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    headers: req.headers,
    params: req.params,
    body: req.body,
  });
  //** HTTP RESPONSE
  if (!isUserAuthenticated(req)) {
    const response = new ResponseBuilder()
      .setStatus("error")
      .setStatusCode(StatusCodes.UNAUTHORIZED)
      .setMessage("Unauthorized")
      .build();
    return res.status(response.statusCode).json(response);
  }

  if (err instanceof AppError) {
    const response = new ResponseBuilder()
      .setStatus("error")
      .setStatusCode(err.statusCode)
      .setMessage(err.message)
      .setErrorCode(err.code)
      .build();
    return res.status(response.statusCode).json(response);
  }

  const response = new ResponseBuilder()
    .setStatus("error")
    .setStatusCode(StatusCodes.INTERNAL_SERVER_ERROR)
    .setMessage("Internal Server Error")
    .build();

  return res.status(response.statusCode).json(response);
};

export default errorHandler;
