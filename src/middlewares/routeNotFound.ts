import { Request, Response } from 'express';
import { RouteNotFoundError } from '@utils/errors';

/**
 * @name routeNotFound
 * @description Middleware to handle requests for routes that are not found.
 * @summary When a route is not found, this middleware sets the response status to 404
 * and passes an error with a message indicating the original URL that was not found.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @throws {Error} If the route is not found.
 */
export default function routeNotFound(req: Request, res: Response): void {
  const error = new RouteNotFoundError(`🔍 - Not Found - ${req.originalUrl}`);
  res.status(404).json({ error: error.message });
}
