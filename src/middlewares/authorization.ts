//** EXTERNAL LIBRARIES
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { container } from 'tsyringe';
//** INTERNAL UTILS
import { AuthenticationError, AuthorizationError } from '@utils/errors';
//** INTERNAL MODULES
import PermissionService from '@api/v1/permission/permission.service';

interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
}

/**
 * Middleware function that checks if the current user has the required permissions to access a resource.
 *
 * @param {string[]} requiredPermissions - An array of permission names that the user must have to access the resource.
 * @returns {RequestHandler} - An Express middleware function that performs the authorization check.
 */
export const authorization = (requiredPermissions: string[]): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as RequestWithUser).user?.id;
      if (!userId) {
        throw new AuthenticationError('User not authenticated');
      }

      const permissionService = container.resolve(PermissionService);
      const userPermissions = await permissionService.getPermissionByUserId(userId);

      const hasRequiredPermissions = requiredPermissions.every((requiredPermission) =>
        userPermissions.some((userPermission) => userPermission.name === requiredPermission),
      );

      if (!hasRequiredPermissions) {
        throw new AuthorizationError('User does not have required permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
