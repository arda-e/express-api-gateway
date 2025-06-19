import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import DatabaseManager from "@db/db.manager";
import { RedisManager } from "@utils/RedisManager";
import { ApiResponse } from "@utils/Response";
import { Route } from "@utils/decorators";

@injectable()
export class AdminController {
  constructor(
    @inject(DatabaseManager) private readonly dbManager: DatabaseManager,
    @inject(RedisManager) private readonly redisManager: RedisManager,
  ) {}

  @Route()
  public async health(
    _req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ApiResponse<{ database: string; redis: string }>> {
    const db = this.dbManager.getDatabase();
    await db.query("SELECT 1");
    await this.redisManager.getRedisClient().ping();
    return ApiResponse.success({ database: "ok", redis: "ok" }, "Service healthy");
  }
}

export default AdminController;
