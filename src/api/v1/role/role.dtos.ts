import { IsString, IsUUID, Length } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(3, 255)
  description: string;
}

export class UpdateRoleDTO {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(3, 255)
  description: string;
}
1;
export class GetRoleDTO {
  @IsUUID()
  id: string;
}
export class DeleteRoleDTO {
  @IsUUID()
  id: string;
}

export class AssignRoleDTO {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}

export class RemoveRoleDTO {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}

export class GetUserRolesDTO {
  @IsUUID()
  userId: string;
}

export class AssignPermissionDTO {
  @IsUUID()
  roleId: string;

  @IsUUID()
  permissionId: string;
}

export class RemovePermissionDTO {
  @IsUUID()
  roleId: string;

  @IsUUID()
  permissionId: string;
}

export class GetRolePermissionsDTO {
  @IsUUID()
  roleId: string;
}
