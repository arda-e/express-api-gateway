//** EXTERNAL LIBRARIES
import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
//** INTERNAL UTILS
import DatabaseManager from "@db/db.manager";
import { ResourceDoesNotExistError } from "@utils/errors";
import { KnexRepository } from "@utils/Repository";
//** INTERNAL MODULES
import { User, AuthRepository } from "@api/v1/auth";
import { Role, RoleUser } from "@api/v1/role/models";
import { RoleRepository } from "@api/v1/role/repositories";

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
    return "role_user";
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    trx?: Knex.Transaction,
  ): Promise<RoleUser> {
    await this.ensureUserExists(userId, trx);
    await this.ensureRoleExists(roleId, trx);
    const roleUser = new RoleUser(undefined, userId, roleId);

    const query = this.getQueryBuilder(trx);
    const [result] = await query.insert(roleUser).returning("*");
    return result;
  }

  async removeRoleFromUser(
    userId: string,
    roleId: string,
    trx?: Knex.Transaction,
  ): Promise<number> {
    await this.ensureUserExists(userId, trx);
    await this.ensureRoleExists(roleId, trx);

    const query = this.getQueryBuilder(trx);
    return query.where({ user_id: userId, role_id: roleId }).delete();
  }

  async getUserRoles(userId: string, trx?: Knex.Transaction): Promise<Role[]> {
    await this.ensureUserExists(userId, trx);

    const query = this.db("roles");
    if (trx) {
      query.transacting(trx);
    }

    return query
      .join("role_user", "roles.id", "role_user.role_id")
      .where("role_user.user_id", userId)
      .select("roles.*");
  }

  async getUsersByRole(roleId: string, trx?: Knex.Transaction): Promise<User[]> {
    await this.ensureRoleExists(roleId, trx);

    const query = this.db("users");
    if (trx) {
      query.transacting(trx);
    }

    return query
      .join("role_user", "users.id", "role_user.user_id")
      .where("role_user.role_id", roleId)
      .select("users.*");
  }

  private async ensureUserExists(userId: string, trx?: Knex.Transaction): Promise<void> {
    const user = await this.authRepository.findById(userId, trx);
    if (!user) {
      throw new ResourceDoesNotExistError("User not found");
    }
  }

  private async ensureRoleExists(roleId: string, trx?: Knex.Transaction): Promise<void> {
    const role = await this.roleRepository.findById(roleId, trx);
    if (!role) {
      throw new ResourceDoesNotExistError("Role not found");
    }
  }
}

export default RoleUserRepository;
