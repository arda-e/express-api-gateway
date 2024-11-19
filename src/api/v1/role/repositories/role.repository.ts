//** EXTERNAL LIBRARIES
import { inject, injectable } from 'tsyringe';
//** INTERNAL UTILS
import { KnexRepository } from '@utils/Repository';
import DatabaseManager from '@db/db.manager';
//** INTERNAL MODULES
import Role from '@api/v1/role/models/role.model';

@injectable()
class RoleRepository extends KnexRepository<Role> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return 'roles';
  }
}

export default RoleRepository;
