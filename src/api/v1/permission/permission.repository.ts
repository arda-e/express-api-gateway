import Permission from '@api/v1/permission/permission.model';
import { KnexRepository } from '@utils/Repository';
import { inject, injectable } from 'tsyringe';
import DatabaseManager from '@db/db.manager';

@injectable()
class PermissionRepository extends KnexRepository<Permission> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return 'permissions';
  }
}

export default PermissionRepository;
