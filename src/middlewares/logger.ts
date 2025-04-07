import { Request, Response, NextFunction } from "express";
import Logger from "@utils/Logger";

const logger = Logger.getLogger();

/**
 * Middleware function that logs the HTTP method and URL for each incoming request.
 * @param req - The Express request object.
 * @param _res - The Express response object.
 * @param next - The Express next middleware function.
 */
const loggerMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.url}`);
    next();
  } catch (error) {
    next(error);
  }
};

export default loggerMiddleware;
