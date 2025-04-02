// Example file demonstrating transaction decorators usage
import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
import { Transaction, RequiresTransaction } from "@utils/decorators";
import { RoleRepository, RoleUserRepository } from "@api/v1/role/repositories";
import { v4 as uuidv4 } from "uuid";
import { Role } from "@api/v1/role/models";

/**
 * Example service that demonstrates how to use transaction decorators
 */
@injectable()
class ExampleService {
  constructor(
    @inject(RoleRepository) private roleRepository: RoleRepository,
    @inject(RoleUserRepository) private roleUserRepository: RoleUserRepository,
  ) {}

  /**
   * Example method that uses the Transaction decorator
   * This method creates a role and assigns it to a user in a single transaction
   * If either operation fails, the entire transaction is rolled back
   */
  @Transaction()
  async createRoleAndAssignToUser(
    roleName: string,
    userId: string,
    trx?: Knex.Transaction,
  ): Promise<any> {
    // Create a new role
    const newRole = await this.roleRepository.create(
      {
        name: roleName,
        description: `Role created by transaction example: ${roleName}`,
        created_at: new Date(),
        updated_at: new Date(),
        permissions: ["default-permission"],
      },
      trx, // Pass the transaction object
    );

    // Assign the role to a user
    await this.roleUserRepository.assignRoleToUser(userId, newRole.id, trx);

    return newRole;
  }

  /**
   * Example method that composes multiple transactional methods
   * The outer method starts a transaction and passes it to inner methods
   */
  @Transaction()
  async complexOperation(userId: string, trx?: Knex.Transaction): Promise<any> {
    // Create multiple roles in sequence, all within the same transaction
    const adminRole = await this.createRole("admin", trx!);
    const editorRole = await this.createRole("editor", trx!);

    // Assign both roles to the user within the same transaction
    await this.roleUserRepository.assignRoleToUser(userId, adminRole.id, trx);
    await this.roleUserRepository.assignRoleToUser(userId, editorRole.id, trx);

    return {
      user: userId,
      roles: [adminRole, editorRole],
    };
  }

  /**
   * Example of a method that requires a transaction to be passed
   * This method will throw an error if no transaction is provided
   */
  @RequiresTransaction()
  async createRole(roleName: string, trx: Knex.Transaction): Promise<Role> {
    return this.roleRepository.create(
      {
        name: roleName,
        description: `Role created within transaction: ${roleName}`,
        created_at: new Date(),
        updated_at: new Date(),
        permissions: [`${roleName}-permission`],
      },
      trx,
    );
  }
}

export default ExampleService;
