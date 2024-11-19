//** EXTERNAL LIBRARIES
import { Router } from 'express';
//** INTERNAL UTILS
import { RoleActions } from '@utils/enums';
import { authorization, validateRequest } from '@middlewares/';

//** INTERNAL MODULES
import * as RoleController from './role.controllers';
import * as DTO from './role.dtos';

const router = Router();

router
  .route('/')
  .get(RoleController.getRoles)
  .post(
    validateRequest(DTO.CreateRoleDTO),
    authorization([RoleActions.CREATE_ROLE]),
    RoleController.createRole,
  );

router
  .route('/:id')
  .get(
    validateRequest(DTO.GetRoleDTO),
    authorization([RoleActions.READ_ROLE]),
    RoleController.getRole,
  )
  .put(
    validateRequest(DTO.UpdateRoleDTO),
    authorization([RoleActions.UPDATE_ROLE]),
    RoleController.updateRole,
  )
  .delete(
    validateRequest(DTO.DeleteRoleDTO),
    authorization([RoleActions.DELETE_ROLE]),
    RoleController.deleteRole,
  );

router.post(
  '/assign',
  validateRequest(DTO.AssignRoleDTO),
  authorization([RoleActions.ASSIGN_ROLE]),
  RoleController.assignRoleToUser,
);
router.post(
  '/remove',
  validateRequest(DTO.RemoveRoleDTO),
  authorization([RoleActions.UPDATE_ROLE]),
  RoleController.removeRoleFromUser,
);
router.get(
  '/user/:userId',
  validateRequest(DTO.GetUserRolesDTO),
  authorization([RoleActions.READ_ROLE]),
  RoleController.getUserRoles,
);

router.post(
  '/assign-permission',
  validateRequest(DTO.AssignPermissionDTO),
  authorization(['assign:permission']),
  RoleController.assignPermissionToRole,
);

router.post(
  '/remove-permission',
  validateRequest(DTO.RemovePermissionDTO),
  authorization(['remove:permission']),
  RoleController.removePermissionFromRole,
);

router.get(
  '/:roleId/permissions',
  validateRequest(DTO.GetRolePermissionsDTO),
  RoleController.getRolePermissions,
);

export default router;
