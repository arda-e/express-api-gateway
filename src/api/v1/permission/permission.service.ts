import { injectable, inject } from "tsyringe";
import { ResourceAlreadyExistsError, ResourceDoesNotExistError } from "@utils/errors";
import { Paginated } from "@utils/decorators";
import { PaginationResult } from "@utils/pagination";

import Permission from "./permission.model";
import PermissionRepository from "./permission.repository";

@injectable()
class PermissionService {
  constructor(@inject(PermissionRepository) private permissionRepository: PermissionRepository) {}

  @Paginated()
  public async getPermissions(
    page?: number,
    limit?: number,
  ): Promise<PaginationResult<Permission>> {
    const { data, total } = await this.permissionRepository.findAllPaginated(
      page ?? 1,
      limit ?? 10,
    );
    return { data, total } as unknown as PaginationResult<Permission>;
  }

  public async getPermission(permissionId: string): Promise<Permission | null> {
    const existingPermission = await this.permissionRepository.findById(permissionId);
    if (!existingPermission) {
      throw new ResourceDoesNotExistError("Permission not found");
    }
    return existingPermission;
  }

  public async getPermissionByUserId(userId: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.findByUserId(userId);
    if (!permissions || permissions.length === 0) {
      throw new ResourceDoesNotExistError("Permissions not found");
    }
    return permissions;
  }

  public async createPermission(permission: Permission): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByField("name", permission.name);
    if (existingPermission) {
      throw new ResourceAlreadyExistsError("Permission already exists");
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
      throw new ResourceDoesNotExistError("Permission not found");
    }
    return existingPermission;
  }
}

export default PermissionService;
