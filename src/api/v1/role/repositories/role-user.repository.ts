//** EXTERNAL LIBRARIES
import { inject, injectable } from 'tsyringe';
//** INTERNAL UTILS
import DatabaseManager from '@db/db.manager';
import { ResourceDoesNotExistError } from '@utils/errors';
import { KnexRepository } from '@utils/Repository';
//** INTERNAL MODULES
import User from '@api/v1/auth/auth.model';
import { AuthRepository } from '@api/v1/auth';
import { Role, RoleUser } from '@api/v1/role/models';
import { RoleRepository } from '@api/v1/role/repositories';

@injectable()
class RoleUserRepository extends KnexRepository<RoleUser> {
  constructor(
    @inject(AuthRepository) private authRepository: AuthRepository,
    @inject(RoleRepository) private roleRepository: RoleRepository,
    @inject(DatabaseManager) protected databaseManager: DatabaseManager,
  ) {
    super(databaseManager);
  }

  getTableName(): string {
    return 'role_user';
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<RoleUser> {
    await this.ensureUserExists(userId);
    await this.ensureRoleExists(roleId);
    const roleUser = new RoleUser(undefined, userId, roleId);
    const [result] = await this.db(this.getTableName()).insert(roleUser).returning('*');
    return result;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<number> {
    await this.ensureUserExists(userId);
    await this.ensureRoleExists(roleId);
    return this.db(this.getTableName()).where({ user_id: userId, role_id: roleId }).delete();
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    await this.ensureUserExists(userId);
    return this.db<Role>('roles')
      .join('role_user', 'roles.id', 'role_user.role_id')
      .where('role_user.user_id', userId)
      .select('roles.*');
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    await this.ensureRoleExists(roleId);
    return this.db<User>('users')
      .join('role_user', 'users.id', 'role_user.user_id')
      .where('role_user.role_id', roleId)
      .select('users.*');
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }
  }

  private async ensureRoleExists(roleId: string): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new ResourceDoesNotExistError('Role not found');
    }
  }
}

export default RoleUserRepository;
