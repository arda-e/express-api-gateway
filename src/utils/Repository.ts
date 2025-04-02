//** EXTERNAL LIBRARIES
import { Knex } from "knex";
import { inject } from "tsyringe";
//** INTERNAL UTILS
import DatabaseManager from "@db/db.manager";
import { ResourceDoesNotExistError } from "@utils/errors";

type InsertData<T> = Omit<T, "id">;

export abstract class KnexRepository<T extends { id: string }> {
  protected db: Knex;

  protected constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    this.db = this.databaseManager.getDatabase().getInstance();
  }

  abstract getTableName(): string;

  /**
   * Get a query builder for the table, optionally using the provided transaction.
   * @param trx Optional transaction object
   * @returns A query builder for the table
   */
  protected getQueryBuilder(trx?: Knex.Transaction): Knex.QueryBuilder {
    const queryBuilder = this.db(this.getTableName());
    return trx ? queryBuilder.transacting(trx) : queryBuilder;
  }

  /**
   * Creates a new record in the database
   * @param item The item to create
   * @param trx Optional transaction object
   * @returns The created item
   */
  async create(item: InsertData<T>, trx?: Knex.Transaction): Promise<T> {
    const query = this.getQueryBuilder(trx);
    const [createdItem] = await query.insert(item).returning("*");
    return createdItem;
  }

  /**
   * Finds a record by ID
   * @param id The ID to search for
   * @param trx Optional transaction object
   * @returns The found item or null
   */
  async findById(id: string, trx?: Knex.Transaction): Promise<T | null> {
    const query = this.getQueryBuilder(trx);
    const result = await query.where("id", id).first();

    if (!result) {
      throw new ResourceDoesNotExistError(`Item with id ${id} does not exist`);
    }

    return result;
  }

  /**
   * Finds records by a field value
   * @param field The field to search by
   * @param value The value to search for
   * @param trx Optional transaction object
   * @returns An array of matching items or null
   */
  async findByField<K extends keyof T>(
    field: K,
    value: T[K],
    trx?: Knex.Transaction,
  ): Promise<T[] | null> {
    const query = this.getQueryBuilder(trx);
    const result = await query.where({
      [field]: value,
    });

    if (!result) {
      throw new ResourceDoesNotExistError(`Item with ${String(field)} ${value} does not exist`);
    }

    return result as T[];
  }

  /**
   * Deletes a record by ID
   * @param id The ID of the record to delete
   * @param trx Optional transaction object
   * @returns True if the record was deleted
   */
  async deleteById(id: string, trx?: Knex.Transaction): Promise<boolean> {
    await this.findById(id, trx);

    const query = this.getQueryBuilder(trx);
    const deletedCount = await query.where("id", id).del();
    return deletedCount > 0;
  }

  /**
   * Updates a record by ID
   * @param id The ID of the record to update
   * @param updateData The data to update
   * @param trx Optional transaction object
   * @returns The updated record
   */
  async update(id: string, updateData: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    await this.findById(id, trx);

    if ("id" in updateData) {
      throw new Error("Updating 'id' is not allowed");
    }

    const query = this.getQueryBuilder(trx);
    const [updatedItem] = await query
      .where("id", id)
      .update(updateData as Knex.DbRecord<T>)
      .returning("*");
    return updatedItem as T;
  }

  /**
   * Finds all records in the table
   * @param trx Optional transaction object
   * @returns An array of all records
   */
  async findAll(trx?: Knex.Transaction): Promise<T[]> {
    const query = this.getQueryBuilder(trx);
    return query.select("*");
  }
}
