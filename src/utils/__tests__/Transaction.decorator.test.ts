import "reflect-metadata";
import { container } from "tsyringe";
import { Knex } from "knex";

import { Transaction } from "../decorators/Transaction/Transaction";
import { RequiresTransaction } from "../decorators/Transaction/RequiresTransaction";

class FakeRepository {
  @RequiresTransaction()
  async create(data: string, trx: Knex.Transaction): Promise<Knex.Transaction> {
    return trx;
  }
}

class FakeService {
  constructor(public repo: FakeRepository) {}

  @Transaction()
  async create(data: string, trx?: Knex.Transaction): Promise<Knex.Transaction> {
    return this.repo.create(data, trx!);
  }
}

describe("Transaction and RequiresTransaction Decorators", () => {
  let repo: FakeRepository;
  let service: FakeService;
  let mockTrx: any;
  let mockDb: { transaction: jest.Mock };
  let mockDatabaseManager: any;

  beforeEach(() => {
    repo = new FakeRepository();
    service = new FakeService(repo);

    mockTrx = { commit: jest.fn(), rollback: jest.fn() };
    mockDb = { transaction: jest.fn(async (cb: any) => await cb(mockTrx)) };
    const mockDatabase = { getInstance: jest.fn(() => mockDb) };
    mockDatabaseManager = { getDatabase: jest.fn(() => mockDatabase) };
    jest.spyOn(container, "resolve").mockReturnValue(mockDatabaseManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a transaction when none provided", async () => {
    const result = await service.create("data");

    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockTrx);
  });

  it("reuses provided transaction", async () => {
    const existingTrx = { commit: jest.fn(), rollback: jest.fn() } as any;

    const result = await service.create("data", existingTrx);

    expect(mockDb.transaction).not.toHaveBeenCalled();
    expect(result).toBe(existingTrx);
  });

  it("throws when repository called without transaction", async () => {
    await expect(repo.create("data" as any, undefined as any)).rejects.toThrow(
      "Method create requires a transaction object as the last parameter",
    );
  });
});
