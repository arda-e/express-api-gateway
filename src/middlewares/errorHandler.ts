import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
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
 * Express error handling middleware.
 *
 * Logs detailed error information and sends an appropriate response.
 * If the response object does not have a standard Express interface (i.e. no .status() method),
 * it falls back to calling res.end() if available.
 *
 * @param {Error} err - The error object that was thrown.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object (may not be standard).
 * @param {NextFunction} next - The next middleware function.
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    headers: req.headers,
    params: req.params,
    body: req.body,
  });

  // Build a response payload using ResponseBuilder
  let response;
  if (!isUserAuthenticated(req)) {
    response = new ResponseBuilder()
      .setStatus("error")
      .setStatusCode(StatusCodes.UNAUTHORIZED)
      .setMessage("Unauthorized")
      .build();
  } else if (err instanceof AppError) {
    response = new ResponseBuilder()
      .setStatus("error")
      .setStatusCode(err.statusCode)
      .setMessage(err.message)
      .setErrorCode(err.code)
      .build();
  } else {
    response = new ResponseBuilder()
      .setStatus("error")
      .setStatusCode(StatusCodes.INTERNAL_SERVER_ERROR)
      .setMessage("Internal Server Error")
      .build();
  }

  // Check if the 'res' object has a status function; if so, use it
  if (res && typeof res.status === "function") {
    return res.status(response.statusCode).json(response);
  } else if (res && typeof res.end === "function") {
    // Fallback: if not an Express response, end the response with the message
    console.error("Response object does not support res.status(), falling back to res.end().");
    return res.end("Internal Server Error");
  } else {
    // Last resort - log that there's no valid response
    console.error("No valid response object available to send error response.", err);
  }
};

export default errorHandler;
