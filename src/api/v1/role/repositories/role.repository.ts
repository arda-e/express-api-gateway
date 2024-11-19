import Role from '@api/v1/role/models/role.model';
import { KnexRepository } from '@utils/Repository';
import { inject, injectable } from 'tsyringe';
import DatabaseManager from '@db/db.manager';

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
