import { Knex } from "knex";
import DatabaseManager from "@db/db.manager";
import { container } from "tsyringe";

/**
 * A decorator that wraps a repository or service method in a Knex transaction.
 * The decorated method will receive a transaction object as the last parameter.
 * If the method is already inside a transaction, the existing transaction will be used.
 *
 * @returns Method decorator function
 *
 * @example
 * ```ts
 * class UserService {
 *   @Transaction()
 *   async createUser(userData: UserData, trx?: Knex.Transaction): Promise<User> {
 *     // trx is auto-injected
 *     return this.userRepository.create(userData, trx);
 *   }
 * }
 * ```
 */
export function Transaction() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Get the database manager from the dependency injection container
      const databaseManager = container.resolve(DatabaseManager);
      const db = databaseManager.getDatabase().getInstance() as Knex;

      // Check if the last argument is already a transaction
      const lastArg = args[args.length - 1];
      const isTransactionProvided =
        lastArg && typeof lastArg === "object" && "commit" in lastArg && "rollback" in lastArg;

      // If a transaction is already provided, use it
      if (isTransactionProvided) {
        return await originalMethod.apply(this, args);
      }

      // Otherwise, create a new transaction
      return await db.transaction(async (trx) => {
        // Add the transaction as the last parameter
        const newArgs = [...args, trx];
        return await originalMethod.apply(this, newArgs);
      });
    };

    return descriptor;
  };
}
