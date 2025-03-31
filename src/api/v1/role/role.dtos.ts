import { IsString, IsUUID, Length } from "class-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.CreateRole:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           example: Admin
 *         description:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: Administrator role with full access
 */
export class CreateRoleDTO {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(3, 255)
  description: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.UpdateRole:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           example: Editor
 *         description:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: Editor role with content management access
 */
export class UpdateRoleDTO {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(3, 255)
  description: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.GetRole:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 */
export class GetRoleDTO {
  @IsUUID()
  id: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.DeleteRole:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 */
export class DeleteRoleDTO {
  @IsUUID()
  id: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.AssignRole:
 *       type: object
 *       required:
 *         - userId
 *         - roleId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         roleId:
 *           type: string
 *           format: uuid
 *           example: 223e4567-e89b-12d3-a456-426614174000
 */
export class AssignRoleDTO {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.RemoveRole:
 *       type: object
 *       required:
 *         - userId
 *         - roleId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         roleId:
 *           type: string
 *           format: uuid
 *           example: 223e4567-e89b-12d3-a456-426614174000
 */
export class RemoveRoleDTO {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.GetUserRoles:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 */
export class GetUserRolesDTO {
  @IsUUID()
  userId: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.AssignPermission:
 *       type: object
 *       required:
 *         - roleId
 *         - permissionId
 *       properties:
 *         roleId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         permissionId:
 *           type: string
 *           format: uuid
 *           example: 323e4567-e89b-12d3-a456-426614174000
 */
export class AssignPermissionDTO {
  @IsUUID()
  roleId: string;

  @IsUUID()
  permissionId: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.RemovePermission:
 *       type: object
 *       required:
 *         - roleId
 *         - permissionId
 *       properties:
 *         roleId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         permissionId:
 *           type: string
 *           format: uuid
 *           example: 323e4567-e89b-12d3-a456-426614174000
 */
export class RemovePermissionDTO {
  @IsUUID()
  roleId: string;

  @IsUUID()
  permissionId: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.GetRolePermissions:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 */
export class GetRolePermissionsDTO {
  @IsUUID()
  roleId: string;
}
