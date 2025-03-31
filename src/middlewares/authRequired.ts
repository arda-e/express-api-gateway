import { Request, Response, NextFunction } from "express";
import { AuthenticationError } from "@utils/errors";

/**
 * Authentication middleware
 *
 * Checks if a user is authenticated by verifying that a valid userId exists in the session
 * If no userId is found, throws an AuthenticationError
 *
 * @param req Express request object
 * @param _res Express response object
 * @param next Express next function
 */
export const authRequired = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authRequired;
