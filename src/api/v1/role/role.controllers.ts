//** EXTERNAL LIBRARIES
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from 'tsyringe';
//** INTERNAL UTILS
import { ResponseBuilder } from '@utils/ResponseBuilder';

//** INTERNAL MODULES
import RoleService from './role.service';

const roleService = container.resolve(RoleService);
export const getRoles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await roleService.getRoles();
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setData(roles)
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // !TODO: check service for correct error throw
    const role = await roleService.createRole(req.body);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.CREATED)
      .setMessage('Role successfully created.')
      .setStatus('success')
      .setData(role)
      .build();

    res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};
export const getRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roleId = req.params.id;
    // !TODO: check service for correct error throw
    const role = await roleService.getRole(roleId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setData(role)
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const roleId = req.params.id;
    const role = await roleService.updateRole(roleId, req.body);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Role successfully updated.')
      .setData(role)
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const roleId = req.params.id;
    await roleService.deleteRole(roleId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Role successfully deleted.')
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
export const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId, roleId } = req.body;
    // !TODO: check service for correct error throw
    const updatedUser = await roleService.assignRoleToUser(userId, roleId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Role successfully assigned to user.')
      .setData(updatedUser)
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const removeRoleFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId, roleId } = req.body;
    // !TODO: check service for correct error throw
    await roleService.removeRoleFromUser(userId, roleId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Role successfully removed from user.')
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.userId;
    // !TODO: check service for correct error throw
    const roles = await roleService.getUserRoles(userId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setData(roles)
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const assignPermissionToRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { roleId, permissionId } = req.body;
    await roleService.assignPermissionToRole(roleId, permissionId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Permission successfully assigned to role.')
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { roleId, permissionId } = req.body;
    await roleService.removePermissionFromRole(roleId, permissionId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Permission successfully removed from role.')
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRolePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const roleId = req.params.roleId;
    const permissions = await roleService.getRolePermissions(roleId);
    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.OK)
      .setStatus('success')
      .setMessage('Permissions successfully retrieved.')
      .setData(permissions)
      .build();

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};
