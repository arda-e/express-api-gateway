//** EXTERNAL LIBRARIES
import { inject, injectable } from 'tsyringe';
//** INTERNAL UTILS
import DatabaseManager from '@db/db.manager';
import { KnexRepository } from '@utils/Repository';
import { handleDatabaseError } from '@utils/databaseErrorHandler';
//** LOCAL MODULES
import { Role, RoleUser } from '@api/v1/role/models';

import User from './auth.model';

@injectable()
class AuthRepository extends KnexRepository<User> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return 'authentication.users';
  }

  async createUser(
    username: string,
    email: string,
    password: string,
    roleIds: string[],
  ): Promise<User> {
    try {
      console.log('AuthRepository: Starting user creation');
      const user = new User(undefined, username, email, password);
      await user.hashPassword();
      const [createdUser] = await this.db(this.getTableName())
        .insert({
          username: user.username,
          email: user.email,
          password: user.password,
        })
        .returning('*');

      if (roleIds?.length > 0) {
        await this.db('authentication.user_roles').insert(
          roleIds.map((roleId) => new RoleUser(undefined, createdUser.id, roleId)),
        );
      }

      const roles = await this.getUserRoles(createdUser.id);
      return new User(
        createdUser.id,
        createdUser.username,
        createdUser.email,
        createdUser.password,
        roles,
      );
    } catch (error: any) {
      handleDatabaseError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.db(this.getTableName()).where({ email }).first();

      if (user) {
        const roles = await this.getUserRoles(user.id);
        return new User(user.id, user.username, user.email, user.password, roles);
      }

      return null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  private async getUserRoles(userId: string): Promise<Role[]> {
    return this.db('authentication.roles')
      .join('authentication.user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', userId)
      .select('roles.*');
  }
}

export default AuthRepository;
