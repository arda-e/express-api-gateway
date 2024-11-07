import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsUUID } from 'class-validator';
import { PermissionActions } from '@utils/enums';

/** Base DTO for permissions with ID */
export class BasePermissionDTO {
  @IsUUID()
  id: string;
}

/** Base DTO for permissions with name and description */
export class BasePermissionNameDTO {
  @IsEnum(PermissionActions, {
    message:
      'Invalid permission name. It should be in the format "action:resource" (e.g., create:permission)',
  })
  name: PermissionActions;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(255)
  description?: string;
}

/** DTO for creating a new permission */
export class CreatePermissionDTO extends BasePermissionNameDTO {}

/** DTO for updating an existing permission */
export class UpdatePermissionDTO extends BasePermissionNameDTO {
  @IsUUID()
  id: string;
}

/** DTO for retrieving a permission by ID */
export class GetPermissionByIdDTO extends BasePermissionDTO {}

/** DTO for deleting a permission by ID */
export class DeletePermissionByIdDTO extends BasePermissionDTO {}
