//** EXTERNAL LIBRARIES
import { inject, injectable } from 'tsyringe';
//** INTERNAL UTILS
import { KnexRepository } from '@utils/Repository';
import DatabaseManager from '@db/db.manager';
//** INTERNAL MODULES
import Permission from '@api/v1/permission/permission.model';

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
