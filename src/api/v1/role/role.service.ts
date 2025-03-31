//** EXTERNAL LIBRARIES
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "tsyringe";
//** INTERNAL UTILS
import {
  DatabaseError,
  ResourceAlreadyExistsError,
  ResourceDoesNotExistError,
} from "@utils/errors";
import { Catch } from "@utils/decorators";
//** INTERNAL MODULES
import { User, AuthRepository } from "@api/v1/auth";
import { Role, RolePermission } from "@api/v1/role/models";
import {
  RolePermissionRepository,
  RoleRepository,
  RoleUserRepository,
} from "@api/v1/role/repositories";

@injectable()
class RoleService {
  constructor(
    @inject(RoleRepository) private roleRepository: RoleRepository,
    @inject(AuthRepository) private authRepository: AuthRepository,
    @inject(RoleUserRepository) private userRoleRepository: RoleUserRepository,
    @inject(RolePermissionRepository) private rolePermissionRepository: RolePermissionRepository,
  ) {}

  /**
   * Retrieves all existing roles from the system.
   *
   * @returns An array of all roles in the system.
   * @throws {DatabaseError} If there is an error retrieving roles from the database.
   */
  @Catch("Failed to retrieve roles")
  public async getRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  /**
   * Retrieves an existing role from the system by its ID.
   *
   * @param roleId - The ID of the role to retrieve.
   * @returns The existing role, or `null` if the role does not exist.
   * @throws {ResourceDoesNotExistError} If the role with the given ID does not exist.
   * @throws {DatabaseError} If there is an error retrieving the role from the database.
   */
  @Catch("Failed to retrieve role")
  public async getRole(roleId: string): Promise<Role | null> {
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new ResourceDoesNotExistError(`Role with ID ${roleId} not found`);
    }
    return existingRole;
  }

  /**
   * Creates a new role in the system.
   *
   * @param role - The role object to create.
   * @returns The created role.
   * @throws {ResourceAlreadyExistsError} If a role with the same name already exists.
   * @throws {DatabaseError} If there is an error creating the role in the database.
   */
  @Catch("Failed to create role")
  public async createRole(role: Role): Promise<Role> {
    const existingRole = await this.roleRepository.findByField("name", role.name);
    if (existingRole) {
      throw new ResourceAlreadyExistsError(`Role with name '${role.name}' already exists`);
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
   * @throws {DatabaseError} If there is an error updating the role in the database.
   */
  @Catch("Failed to update role")
  public async updateRole(roleId: string, role: Role): Promise<Role> {
    await this.ensureRoleExists(roleId);
    return await this.roleRepository.update(roleId, role);
  }

  /**
   * Deletes an existing role from the system.
   *
   * @param roleId - The ID of the role to delete.
   * @returns A Promise that resolves when the role has been deleted.
   * @throws {ResourceDoesNotExistError} If the role with the given ID does not exist.
   * @throws {DatabaseError} If there is an error deleting the role from the database.
   */
  @Catch("Failed to delete role")
  public async deleteRole(roleId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.roleRepository.deleteById(roleId);
  }

  /**
   * Assigns a role to a user.
   *
   * @param userId - The ID of the user to assign the role to.
   * @param roleId - The ID of the role to assign.
   * @returns The updated user object with the assigned role.
   * @throws {ResourceDoesNotExistError} If the user or role does not exist.
   * @throws {DatabaseError} If there is an error assigning the role to the user.
   */
  @Catch("Failed to assign role to user")
  async assignRoleToUser(userId: string, roleId: string): Promise<User | null> {
    await this.ensureRoleExists(roleId);
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError(`User with ID ${userId} not found`);
    }
    await this.userRoleRepository.assignRoleToUser(userId, roleId);
    return this.authRepository.findById(userId);
  }

  /**
   * Removes a role from a user.
   *
   * @param userId - The ID of the user to remove the role from.
   * @param roleId - The ID of the role to remove.
   * @throws {ResourceDoesNotExistError} If the role does not exist.
   * @throws {DatabaseError} If there is an error removing the role from the user.
   */
  @Catch("Failed to remove role from user")
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError(`User with ID ${userId} not found`);
    }
    await this.userRoleRepository.removeRoleFromUser(userId, roleId);
  }

  /**
   * Gets all roles assigned to a user.
   *
   * @param userId - The ID of the user to get roles for.
   * @returns An array of roles assigned to the user.
   * @throws {ResourceDoesNotExistError} If the user does not exist.
   * @throws {DatabaseError} If there is an error retrieving the user's roles.
   */
  @Catch("Failed to get user roles")
  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError(`User with ID ${userId} not found`);
    }
    return this.userRoleRepository.getUserRoles(userId);
  }

  /**
   * Gets all users assigned to a role.
   *
   * @param roleId - The ID of the role to get users for.
   * @returns An array of users assigned to the role.
   * @throws {ResourceDoesNotExistError} If the role does not exist.
   * @throws {DatabaseError} If there is an error retrieving the role's users.
   */
  @Catch("Failed to get users by role")
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
   * @throws {DatabaseError} If there is an error checking the role's existence.
   */
  @Catch("Failed to check role existence")
  private async ensureRoleExists(roleId: string): Promise<Role> {
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new ResourceDoesNotExistError(`Role with ID ${roleId} not found`);
    }
    return existingRole;
  }

  /**
   * Assigns a permission to a role.
   *
   * @param roleId - The ID of the role to assign the permission to.
   * @param permissionId - The ID of the permission to assign.
   * @throws {ResourceDoesNotExistError} If the role does not exist.
   * @throws {DatabaseError} If there is an error assigning the permission to the role.
   */
  @Catch("Failed to assign permission to role")
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.rolePermissionRepository.assignPermissionToRole(roleId, permissionId);
  }

  /**
   * Removes a permission from a role.
   *
   * @param roleId - The ID of the role to remove the permission from.
   * @param permissionId - The ID of the permission to remove.
   * @throws {ResourceDoesNotExistError} If the role does not exist.
   * @throws {DatabaseError} If there is an error removing the permission from the role.
   */
  @Catch("Failed to remove permission from role")
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.ensureRoleExists(roleId);
    await this.rolePermissionRepository.removePermissionFromRole(roleId, permissionId);
  }

  /**
   * Gets all permissions assigned to a role.
   *
   * @param roleId - The ID of the role to get permissions for.
   * @returns An array of permissions assigned to the role.
   * @throws {ResourceDoesNotExistError} If the role does not exist.
   * @throws {DatabaseError} If there is an error retrieving the role's permissions.
   */
  @Catch("Failed to get role permissions")
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    await this.ensureRoleExists(roleId);
    return this.rolePermissionRepository.getRolePermissions(roleId);
  }
}

export default RoleService;
