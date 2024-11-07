import Permission from '@api/v1/permission/permission.model';
import { KnexRepository } from '@utils/Repository';
import { inject, injectable } from 'tsyringe';
import { DatabaseError } from '@utils/errors';

import DatabaseManager from '../../../db/db.manager';

@injectable()
class PermissionRepository extends KnexRepository<Permission> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return 'permissions';
  }

  async findByNames(names: string[]): Promise<Permission[]> {
    try {
      return await this.db(this.getTableName()).whereIn('name', names);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Error finding permissions by names: ${error.message}`);
      }
      throw new DatabaseError('Error finding permissions by names: Unknown error');
    }
  }
}

export default PermissionRepository;
