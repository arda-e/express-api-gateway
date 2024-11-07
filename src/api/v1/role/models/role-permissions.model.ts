import BaseModel from '@utils/Model';
import { IsUUID } from 'class-validator';

class RolePermission extends BaseModel {
  @IsUUID()
  roleId: string;

  @IsUUID()
  permissionId: string;

  constructor(id: string | undefined, roleId: string, permissionId: string) {
    super(id);
    this.roleId = roleId;
    this.permissionId = permissionId;
  }
}

export default RolePermission;
