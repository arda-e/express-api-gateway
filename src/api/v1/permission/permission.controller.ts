//** EXTERNAL LIBRARIES
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe";
//** INTERNAL UTILS
import { ResourceDoesNotExistError, ResourceAlreadyExistsError } from "@utils/errors";
import { ErrorResponseBuilder, ResponseBuilder } from "@utils/ResponseBuilder";
//** INTERNAL MODULES
import { GetPermissionsDTO } from "@api/v1/permission/permission.dto";

import PermissionService from "./permission.service";
import Permission from "./permission.model";

export const getPermissions: RequestHandler = async (_req, res, next) => {
  try {
    const permissionService = container.resolve(PermissionService);

    const { page, limit } = req.query as unknown as GetPermissionsDTO;
    const pageNumber = page ?? 1;
    const limitNumber = limit ?? 10;

    const { permissions, total } = await permissionService.getPermissions(pageNumber, limitNumber);

    res.status(StatusCodes.OK).json(
      new ResponseBuilder()
        .setStatus("success")
        .setStatusCode(StatusCodes.OK)
        .setMessage("Permissions retrieved successfully")
        .setData({
          permissions,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        })
        .build(),
    );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponseBuilder(StatusCodes.NOT_FOUND, error.message).build());
    } else {
      next(error);
    }
  }
};

export const getPermission: RequestHandler = async (req, res, next) => {
  try {
    const permissionService = container.resolve(PermissionService);
    const permission = await permissionService.getPermission(req.params.id);
    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.OK)
          .setMessage("Permission retrieved successfully")
          .setData(permission)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponseBuilder(StatusCodes.NOT_FOUND, error.message).build());
    } else {
      next(error);
    }
  }
};

export const createPermission: RequestHandler = async (req, res, next) => {
  try {
    const permissionService = container.resolve(PermissionService);
    const newPermission = new Permission(undefined, req.body.name, req.body.description);
    const createdPermission = await permissionService.createPermission(newPermission);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.CREATED)
          .setMessage("Permission created successfully")
          .setData(createdPermission)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      res
        .status(StatusCodes.CONFLICT)
        .json(new ErrorResponseBuilder(StatusCodes.CONFLICT, error.message).build());
    } else {
      next(error);
    }
  }
};

export const updatePermission: RequestHandler = async (req, res, next) => {
  try {
    const updatedPermission = new Permission(req.params.id, req.body.name, req.body.description);
    const result = await permissionService.updatePermission(req.params.id, updatedPermission);

    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.OK)
          .setMessage("Permission updated successfully")
          .setData(result)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponseBuilder(StatusCodes.NOT_FOUND, error.message).build());
    } else {
      next(error);
    }
  }
};

export const deletePermission: RequestHandler = async (req, res, next) => {
  try {
    await permissionService.deletePermission(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponseBuilder(StatusCodes.NOT_FOUND, error.message).build());
    } else {
      next(error);
    }
  }
};
