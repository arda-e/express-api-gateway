//** EXTERNAL LIBRARIES
import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
//** INTERNAL UTILS
import DatabaseManager from "@db/db.manager";
import { KnexRepository } from "@utils/Repository";
import { ExceptionHandler } from "@utils/decorators/ExceptionHandler";
import { RequiresTransaction } from "@utils/decorators/Transaction";
//** LOCAL MODULES
import { Role, RoleUser } from "@api/v1/role/models";

import { User } from "./auth.model";

@injectable()
class AuthRepository extends KnexRepository<User> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return "authentication.users";
  }

  @ExceptionHandler("Failed to create user")
  @RequiresTransaction()
  async createUser(
    username: string,
    email: string,
    password: string,
    roleIds: string[],
    trx: Knex.Transaction,
  ): Promise<User> {
    const user = new User(undefined, username, email, password);
    await user.hashPassword();

    const query = this.getQueryBuilder(trx);
    const [createdUser] = await query
      .insert({
        username: user.username,
        email: user.email,
        password: user.password,
      })
      .returning("*");

    if (roleIds?.length > 0) {
      const roleQuery = this.db("authentication.user_roles").transacting(trx);
      await roleQuery.insert(
        roleIds.map((roleId) => new RoleUser(undefined, createdUser.id, roleId)),
      );
    }

    const roles = await this.getUserRoles(createdUser.id, trx);
    return new User(
      createdUser.id,
      createdUser.username,
      createdUser.email,
      createdUser.password,
      roles,
    );
  }

  @ExceptionHandler((params: { email: string }) => `Failed to find user by email ${params.email}`)
  async findByEmail(email: string, trx?: Knex.Transaction): Promise<User | null> {
    const query = this.getQueryBuilder(trx);
    const user = await query.where({ email }).first();

    if (user) {
      const roles = await this.getUserRoles(user.id, trx);
      return new User(user.id, user.username, user.email, user.password, roles);
    }

    return null;
  }

  @ExceptionHandler("Failed to get user roles")
  private async getUserRoles(userId: string, trx?: Knex.Transaction): Promise<Role[]> {
    const query = trx
      ? this.db("authentication.roles").transacting(trx)
      : this.db("authentication.roles");

    return query
      .join("authentication.user_roles", "roles.id", "user_roles.role_id")
      .where("user_roles.user_id", userId)
      .select("roles.*");
  }

  @ExceptionHandler((userId) => `Failed to update user ${userId}`)
  @RequiresTransaction()
  async update(userId: string, updateData: Partial<User>, trx: Knex.Transaction): Promise<User> {
    const query = this.getQueryBuilder(trx);
    const [updatedUser] = await query.where({ id: userId }).update(updateData).returning("*");

    if (!updatedUser) {
      throw new Error("User not found");
    }

    const roles = await this.getUserRoles(updatedUser.id, trx);
    return new User(
      updatedUser.id,
      updatedUser.username,
      updatedUser.email,
      updatedUser.password,
      roles,
    );
  }

  @ExceptionHandler((userId) => `Failed to delete user ${userId}`)
  @RequiresTransaction()
  async deleteById(userId: string, trx: Knex.Transaction): Promise<boolean> {
    const query = this.getQueryBuilder(trx);
    const result = await query.where({ id: userId }).delete();
    return result > 0;
  }
}

export default AuthRepository;
