import "reflect-metadata";
import { PaginateQuery, PaginationResult } from "../decorators/PaginateQuery";

class FakeQueryBuilder<T> {
  private opts: { limit?: number; offset?: number; count?: boolean } = {};
  private countAlias = "total";
  constructor(private rows: T[]) {}

  clone() {
    const qb = new FakeQueryBuilder(this.rows);
    qb.opts = { ...this.opts };
    qb.countAlias = this.countAlias;
    return qb;
  }

  limit(n: number) {
    this.opts.limit = n;
    return this;
  }

  offset(n: number) {
    this.opts.offset = n;
    return this;
  }

  count(_col: string, opts?: { as?: string }) {
    this.opts.count = true;
    if (opts?.as) this.countAlias = opts.as;
    return this;
  }

  first() {
    return Promise.resolve({ [this.countAlias]: this.rows.length });
  }

  then(onFulfilled: any, onRejected: any) {
    return Promise.resolve(this.exec()).then(onFulfilled, onRejected);
  }

  private exec() {
    if (this.opts.count) {
      return [{ [this.countAlias]: this.rows.length }];
    }
    const offset = this.opts.offset ?? 0;
    const end = this.opts.limit !== undefined ? offset + this.opts.limit : undefined;
    return this.rows.slice(offset, end);
  }
}

class TestService {
  constructor(private rows: Array<{ id: number }>) {}

  @PaginateQuery()
  list(req: any) {
    return new FakeQueryBuilder(this.rows);
  }
}

describe("PaginateQuery decorator", () => {
  it("paginates and returns metadata", async () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
    const service = new TestService(rows);
    const req = { query: { page: "2", limit: "5" } };

    const result = (await service.list(req)) as PaginationResult<{ id: number }>;

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(5);
    expect(result.data.map((r) => r.id)).toEqual([6, 7, 8, 9, 10]);
  });

  it("uses defaults and caps limit", async () => {
    const rows = Array.from({ length: 120 }, (_, i) => ({ id: i + 1 }));
    const service = new TestService(rows);
    const req = { query: { page: "2", limit: "150" } };

    const result = (await service.list(req)) as PaginationResult<{ id: number }>;

    expect(result.page).toBe(2);
    expect(result.limit).toBe(100);
    expect(result.data.length).toBe(20);
    expect(result.total).toBe(120);
    expect(result.totalPages).toBe(2);
  });

  it("throws when request not provided", async () => {
    const service = new TestService([]);
    await expect(service.list(undefined as any)).rejects.toThrow(
      "@PaginateQuery requires an Express Request object",
    );
  });
});
