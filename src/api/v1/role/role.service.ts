import { injectable, inject } from 'tsyringe';
import Role from '@api/v1/role/models/role.model';
import {
  DatabaseError,
  ResourceAlreadyExistsError,
  ResourceDoesNotExistError,
} from '@utils/errors';
import { AuthRepository } from '@api/v1/auth/';
import User from '@api/v1/auth/auth.model';
import RolePermissionRepository from '@api/v1/role/repositories/role-permissions.repository';
import Permission from '@api/v1/permission/permission.model';

import RoleRepository from './repositories/role-user.repository';
import UserRoleRepository from './repositories/role-user.repository';
@injectable()
class RoleService {
  constructor(
    @inject(RoleRepository) private roleRepository: RoleRepository,
    @inject(AuthRepository) private authRepository: AuthRepository,
    @inject(UserRoleRepository) private userRoleRepository: UserRoleRepository,
    @inject(RolePermissionRepository) private rolePermissionRepository: RolePermissionRepository,
  ) {}

  /**
   * Retrieves all existing roles from the system.
   *
   * @returns An array of all roles in the system.
   */
  public async getRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  /**
   * Retrieves an existing role from the system by its ID.
   *
   * @param roleId - The ID of the role to retrieve.
   * @returns The existing role, or `null` if the role does not exist.
   * @throws {ResourceDoesNotExistError} If the role with the given ID does not exist.
   */
  public async getRole(roleId: string): Promise<Role | null> {
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new ResourceDoesNotExistError('Role not found');
    }
  }

  /**
   * Creates a new role in the system.
   *
   * @param role - The role object to create.
   * @returns The created role.
   * @throws {ResourceAlreadyExistsError} If a role with the same name already exists.
   */
  public async createRole(role: Role): Promise<Role> {
    const existingRole = await this.roleRepository.findByField('name', role.name);
    if (existingRole) {
      throw new ResourceAlreadyExistsError('Role already exists');
    }
    return await this.roleRepository.create(role);
  }

  /**
   * Updates an existing role in the system.
   *
   * @param roleId - The ID of the role to update.
   * @param role - The updated role object.
   * @returns The updated role.
   * @throws {ResourceDoesNotExistError} If the role with the given ID does not exist.
   */
  public async updateRole(roleId: string, role: Role): Promise<Role> {
    await this.ensureRoleExists(roleId);
    return await this.roleRepository.update(roleId, role); //TODO
  }

  /**
   * Deletes an existing role from the system.
   *
   * @param roleId - The ID of the role to delete.
   * @returns A Promise that resolves when the role has been deleted.
   * @throws {ResourceDoesNotExistError} If the role with the given ID does not exist.
   */
  public async deleteRole(roleId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.roleRepository.deleteById(roleId);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    try {
      await this.ensureRoleExists(roleId);
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new ResourceDoesNotExistError('User not found');
      }
      await this.userRoleRepository.assignRoleToUser(userId, roleId);
      return this.authRepository.findById(userId);
    } catch (error) {
      if (error instanceof ResourceDoesNotExistError) {
        throw error;
      }
      throw new DatabaseError(`Failed to assign role to user: ${error.message}`);
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.userRoleRepository.removeRoleFromUser(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }
    return this.userRoleRepository.getUserRoles(userId);
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    await this.ensureRoleExists(roleId);
    return this.userRoleRepository.getUsersByRole(roleId);
  }

  /**
   * Ensures that a role with the given ID exists in the system.
   *
   * @param roleId - The ID of the role to check.
   * @returns The existing role.
   * @throws {ResourceDoesNotExistError} If the role with the given ID does not exist.
   */
  private async ensureRoleExists(roleId: string): Promise<Role> {
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new ResourceDoesNotExistError('Role not found');
    }
    return existingRole;
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.rolePermissionRepository.assignPermissionToRole(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.rolePermissionRepository.removePermissionFromRole(roleId, permissionId);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    await this.ensureRoleExists(roleId);
    return this.rolePermissionRepository.getRolePermissions(roleId);
  }
}

export default RoleService;
