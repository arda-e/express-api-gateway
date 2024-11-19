import { IsUUID } from 'class-validator';
import BaseModel from '@utils/Model';

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
