//** EXTERNAL LIBRARIES
import { inject, injectable } from "tsyringe";
//** INTERNAL UTILS
import { KnexRepository } from "@utils/Repository";
import DatabaseManager from "@db/db.manager";
//** INTERNAL MODULES
import Permission from "@api/v1/permission/permission.model";

@injectable()
class PermissionRepository extends KnexRepository<Permission> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return "permissions";
  }

  public async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: Permission[]; total: number }> {
    const offset = (page - 1) * limit;
    const query = this.db(this.getTableName());

    const totalQuery = query.clone().count("*", { as: "total" }).first();
    const dataQuery = query.clone().limit(limit).offset(offset);

    const [totalResult, data] = await Promise.all([totalQuery, dataQuery]);

    return {
      data,
      total: Number(totalResult?.total || 0),
    };
  }
}

export default PermissionRepository;
