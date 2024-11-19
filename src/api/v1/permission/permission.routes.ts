//** EXTERNAL LIBRARIES
import { Router } from 'express';
//** INTERNAL UTILS
import { PermissionActions } from '@utils/enums';
import { authorization, validateRequest } from '@middlewares';

//** INTERNAL MODULES
import * as PermissionController from './permission.controller';
import * as DTO from './permission.dto';

const router = Router();

router
  .route('/')
  .get(authorization([PermissionActions.READ_PERMISSION]), PermissionController.getPermissions)
  .post(
    validateRequest(DTO.CreatePermissionDTO),
    authorization([PermissionActions.CREATE_PERMISSION]),
    PermissionController.createPermission,
  );

router
  .route('/:id')
  .get(
    validateRequest(DTO.GetPermissionByIdDTO),
    authorization([PermissionActions.READ_PERMISSION]),
    PermissionController.getPermission,
  )
  .put(
    validateRequest(DTO.UpdatePermissionDTO),
    authorization([PermissionActions.UPDATE_PERMISSION]),
    PermissionController.updatePermission,
  )
  .delete(
    validateRequest(DTO.DeletePermissionByIdDTO),
    authorization([PermissionActions.DELETE_PERMISSION]),
    PermissionController.deletePermission,
  );

export default router;
