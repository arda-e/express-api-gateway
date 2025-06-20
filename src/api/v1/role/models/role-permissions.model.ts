import { IsUUID } from "class-validator";
import BaseModel from "@utils/Model";

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

  public toRecord(): Record<string, any> {
    return {
      roleId: this.roleId,
      permissionId: this.permissionId,
      id: this.id,
      createdAt: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

export default RolePermission;
