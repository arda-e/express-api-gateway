import { Router } from 'express';
import { PermissionActions } from '@utils/enums';

import * as PermissionController from './permission.controller';
import { authorization, validateRequest } from '../../../middlewares';
import {
  CreatePermissionDTO,
  UpdatePermissionDTO,
  DeletePermissionByIdDTO,
  GetPermissionByIdDTO,
} from './permission.dto';

const router = Router();

router
  .route('/')
  .get(authorization([PermissionActions.READ_PERMISSION]), PermissionController.getPermissions)
  .post(
    validateRequest(CreatePermissionDTO),
    authorization([PermissionActions.CREATE_PERMISSION]),
    PermissionController.createPermission,
  );

router
  .route('/:id')
  .get(
    validateRequest(GetPermissionByIdDTO),
    authorization([PermissionActions.READ_PERMISSION]),
    PermissionController.getPermission,
  )
  .put(
    validateRequest(UpdatePermissionDTO),
    authorization([PermissionActions.UPDATE_PERMISSION]),
    PermissionController.updatePermission,
  )
  .delete(
    validateRequest(DeletePermissionByIdDTO),
    authorization([PermissionActions.DELETE_PERMISSION]),
    PermissionController.deletePermission,
  );

export default router;
