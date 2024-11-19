import { inject, injectable } from 'tsyringe';
import { KnexRepository } from '@utils/Repository';
import { DatabaseError } from '@utils/errors/DatabaseError';
import DatabaseManager from '@db/db.manager';

import { RolePermission } from '../models';

@injectable()
class RolePermissionRepository extends KnexRepository<RolePermission> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return 'role_permissions';
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    try {
      const rolePermission = new RolePermission(undefined, roleId, permissionId);
      return await this.create(rolePermission);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to assign permission: ${error.message}`);
      } else {
        throw new DatabaseError('Failed to assign permission to role: Unknown error');
      }
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<number> {
    try {
      return await this.db(this.getTableName())
        .where({ role_id: roleId, permission_id: permissionId })
        .delete();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to remove permission to role: ${error.message}`);
      } else {
        throw new DatabaseError('Failed to remove permission to role: Unknown error');
      }
    }
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    try {
      return await this.db(this.getTableName()).where('role_id', roleId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to get role permissions: ${error.message}`);
      } else {
        throw new DatabaseError('Failed to get role permissions: Unknown error');
      }
    }
  }

  async getPermissionRoles(permissionId: string): Promise<RolePermission[]> {
    try {
      return await this.db(this.getTableName()).where('permission_id', permissionId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to get permission roles: ${error.message}`);
      } else {
        throw new DatabaseError('Failed to get permission roles: Unknown error');
      }
    }
  }
}

export default RolePermissionRepository;
