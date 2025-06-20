import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
import DatabaseManager from "@db/db.manager";
import { KnexRepository } from "@utils/Repository";

import { VerificationTokenModel } from "./verification-token.model";

@injectable()
export class VerificationTokenRepository extends KnexRepository<VerificationTokenModel> {
  constructor(@inject(DatabaseManager) protected databaseManager: DatabaseManager) {
    super(databaseManager);
  }

  getTableName(): string {
    return "authentication.verification_tokens";
  }

  async createToken(
    userId: string,
    token: string,
    type: string,
    expiresAt: Date,
    trx?: Knex.Transaction,
  ): Promise<VerificationTokenModel> {
    const query = this.getQueryBuilder(trx);
    const [row] = await query
      .insert({ user_id: userId, token, type, expires_at: expiresAt })
      .returning("*");
    return VerificationTokenModel.fromRecord(row);
  }

  async findByToken(token: string, trx?: Knex.Transaction): Promise<VerificationTokenModel | null> {
    const query = this.getQueryBuilder(trx);
    const row = await query.where({ token }).first();
    return row ? VerificationTokenModel.fromRecord(row) : null;
  }

  async deleteById(id: string, trx?: Knex.Transaction): Promise<boolean> {
    const query = this.getQueryBuilder(trx);
    const deleted = await query.where({ id }).delete();
    return deleted > 0;
  }
}

export default VerificationTokenRepository;
