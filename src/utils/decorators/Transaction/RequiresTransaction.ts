/**
 * A decorator that ensures the method requires a transaction to be passed.
 * The method should have a transaction parameter as its last parameter.
 * This decorator will throw an error if no transaction is provided.
 *
 * @returns Method decorator function
 *
 * @example
 * ```ts
 * class UserRepository {
 *   @RequiresTransaction()
 *   async create(userData: UserData, trx: Knex.Transaction): Promise<User> {
 *     // trx must be provided by the caller
 *   }
 * }
 * ```
 */
export function RequiresTransaction() {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Check if the last argument is a transaction
      const lastArg = args[args.length - 1];
      const isTransactionProvided =
        lastArg && typeof lastArg === "object" && "commit" in lastArg && "rollback" in lastArg;

      if (!isTransactionProvided) {
        throw new Error(
          `Method ${propertyKey} requires a transaction object as the last parameter`,
        );
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
