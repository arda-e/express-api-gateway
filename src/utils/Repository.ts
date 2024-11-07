import { Knex } from 'knex';
import { DatabaseError } from '@utils/errors/DatabaseError';
import { ResourceDoesNotExistError } from '@utils/errors';
import { inject } from 'tsyringe';

import DatabaseManager from '../db/db.manager';

type InsertData<T> = Omit<T, 'id'>;
type UpdateData<T> = Partial<Omit<T, 'id'>>;

export abstract class KnexRepository<T extends { id: string }> {
  protected db: Knex;

  protected constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    this.db = this.databaseManager.getDatabase().getInstance();
  }

  abstract getTableName(): string;

  async create(item: InsertData<T>): Promise<T> {
    const [createdItem] = await this.db(this.getTableName()).insert(item).returning('*');
    return createdItem;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db(this.getTableName()).where(id).first();

    if (!result) {
      throw new ResourceDoesNotExistError(`Item with id ${id} does not exist`);
    }

    return result;
  }

  async findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[] | null> {
    const result = await this.db<T>(this.getTableName()).where({ [field]: value });

    if (!result) {
      throw new ResourceDoesNotExistError(`Item with ${String(field)} ${value} does not exist`);
    }

    return result as T[];
  }

  async deleteById(id: string): Promise<boolean> {
    await this.findById(id);

    const deletedCount = await this.db(this.getTableName()).where('id', id).del();
    return deletedCount > 0;
  }

  async update(id: string, updateData: UpdateData<T>): Promise<T> {
    await this.findById(id);

    const [updatedItem] = await this.db<T>(this.getTableName())
      .where('id', id)
      .update(updateData)
      .returning('*');
    return updatedItem as T;
  }

  async findAll(): Promise<T[]> {
    return this.db(this.getTableName()).select('*');
  }

  async findManyByField<K extends keyof T>(field: K, values: T[K][]): Promise<T[]> {
    try {
      const results = await this.db<T>(this.getTableName()).whereIn(field as string, values);
      return results;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Failed to find items by field ${field as string}: ${error.message}`,
        );
      } else {
        throw new DatabaseError(`Failed to find items by field ${field as string}`);
      }
    }
  }
}
