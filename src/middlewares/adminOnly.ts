import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { AuthenticationError, AuthorizationError } from "@utils/errors";
import { AuthService } from "@api/v1/auth";

/**
 * Middleware that restricts access to admin users only.
 */
export const adminOnly = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    const authService = container.resolve(AuthService);
    const user = await authService.getMe(userId);
    const isAdmin = user.roles.some((role) => role.name.toLowerCase() === "admin");

    if (!isAdmin) {
      throw new AuthorizationError("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default adminOnly;
