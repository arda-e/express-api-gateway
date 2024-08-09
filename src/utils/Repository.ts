import { Knex } from 'knex';

import DatabaseFactory from '../db/db.factory';

/**
 * An abstract base class that provides common CRUD (Create, Read, Update, Delete) operations for a database table.
 * Subclasses must implement the `getTableName()` method to specify the name of the database table.
 */
export abstract class KnexRepository<T> {
  protected db: Knex;

  protected constructor() {
    const db = DatabaseFactory.getDatabase();
    this.db = db.getInstance();
  }

  /**
   * Returns the name of the database table that this repository operates on.
   * Subclasses must implement this method to specify the table name.
   * @returns The name of the database table.
   */
  abstract getTableName(): string;

  /**
   * Creates a new item in the database table and returns the created item.
   * @param item - The item to create in the database.
   * @returns The created item.
   */
  async create(item: T): Promise<T> {
    const [createdItem] = await this.db(this.getTableName()).insert(item).returning('*');
    return createdItem;
  }
  /**
   * Finds an item in the database by its unique identifier (e.g. primary key).
   * @param id - The unique identifier of the item to find.
   * @returns The found item, or `null` if not found.
   */
  async findById(id: number): Promise<T | null> {
    const item = await this.db(this.getTableName()).where({ id }).first();
    return item || null;
  }
  /**
   * Finds an item in the database by a specific field and its value.
   * @param field - The name of the field to search by.
   * @param value - The value of the field to search for.
   * @returns The found item, or `null` if not found.
   */
  async findByField(field: string, value: any): Promise<T | null> {
    const item = await this.db(this.getTableName())
      .where({ [field]: value })
      .first();
    return item || null;
  }
  /**
   * Deletes an item from the database by its unique identifier (e.g. primary key).
   * @param id - The unique identifier of the item to delete.
   * @returns `true` if the item was deleted, `false` otherwise.
   */
  async deleteById(id: number): Promise<boolean> {
    const deletedCount = await this.db(this.getTableName()).where({ id }).del();
    return deletedCount > 0;
  }
}
