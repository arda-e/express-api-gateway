import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from '@utils/responses/error/ErrorResponse';
import { RouteNotFoundError } from '@utils/errors';

/**
 * @name routeNotFound
 * @description Middleware to handle requests for routes that are not found.
 * @summary When a route is not found, this middleware sets the response status to 404
 * and passes an error with a message indicating the original URL that was not found.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {void} It calls the `next` function to pass control to the next middleware or route handler.
 * @throws {Error} If the route is not found.
 */
export default function routeNotFound(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
): void {
  const error = new RouteNotFoundError(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}
