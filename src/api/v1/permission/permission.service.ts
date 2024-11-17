import { injectable, inject } from 'tsyringe';
import Permission from '@api/v1/permission/permission.model';
import { ResourceAlreadyExistsError, ResourceDoesNotExistError } from '@utils/errors';

import PermissionRepository from './permission.repository';

@injectable()
class PermissionService {
  constructor(@inject(PermissionRepository) private permissionRepository: PermissionRepository) {}

  public async getPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }

  public async getPermission(permissionId: string): Promise<Permission | null> {
    const existingPermission = await this.permissionRepository.findById(permissionId);
    if (!existingPermission) {
      throw new ResourceDoesNotExistError('Permission not found');
    }
    return existingPermission;
  }

  //!TODO It should return Permission[] but currently it returns Permission[]
  public async getPermissionByUserId(userId: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.findByField('id', userId);
    if (!permissions) {
      throw new ResourceDoesNotExistError('Permissions not found');
    }
    return permissions;
  }

  public async createPermission(permission: Permission): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByField('name', permission.name);
    if (existingPermission) {
      throw new ResourceAlreadyExistsError('Permission already exists');
    }
    return await this.permissionRepository.create(permission);
  }

  public async updatePermission(permissionId: string, permission: Permission): Promise<Permission> {
    await this.ensurePermissionExists(permissionId);
    return await this.permissionRepository.update(permissionId, permission);
  }

  public async deletePermission(permissionId: string): Promise<void> {
    await this.ensurePermissionExists(permissionId);
    await this.permissionRepository.deleteById(permissionId);
  }

  private async ensurePermissionExists(permissionId: string): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findById(permissionId);
    if (!existingPermission) {
      throw new ResourceDoesNotExistError('Permission not found');
    }
    return existingPermission;
  }
}

export default PermissionService;
