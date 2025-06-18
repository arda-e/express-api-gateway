import "reflect-metadata";
import DatabaseManager from "@db/db.manager";
import { ResourceDoesNotExistError } from "@utils/errors";

import { KnexRepository } from "../Repository";

interface TestRecord {
  id: string;
  name: string;
}

let idCounter = 1;

class FakeQueryBuilder {
  private whereClause: Record<string, any> | null = null;
  constructor(private data: TestRecord[]) {}

  transacting() {
    return this;
  }

  where(fieldOrObj: any, value?: any) {
    if (typeof fieldOrObj === "object") {
      this.whereClause = fieldOrObj;
    } else {
      this.whereClause = { [fieldOrObj]: value };
    }
    return this;
  }

  private filter() {
    if (!this.whereClause) return this.data;
    return this.data.filter((item) =>
      Object.entries(this.whereClause!).every(([k, v]) => (item as any)[k] === v),
    );
  }

  async first() {
    return this.filter()[0] ?? undefined;
  }

  insert(item: Omit<TestRecord, "id">) {
    const newItem: TestRecord = { id: String(idCounter++), ...(item as any) };
    this.data.push(newItem);
    return { returning: async () => [newItem] };
  }

  update(updateData: Partial<TestRecord>) {
    const item = this.filter()[0];
    if (!item) return { returning: async () => [] };
    Object.assign(item, updateData);
    return { returning: async () => [item] };
  }

  async del() {
    const idx = this.data.findIndex((item) =>
      Object.entries(this.whereClause!).every(([k, v]) => (item as any)[k] === v),
    );
    if (idx !== -1) {
      this.data.splice(idx, 1);
      return 1;
    }
    return 0;
  }

  async select() {
    return [...this.data];
  }

  then(onFulfilled: any, onRejected: any) {
    const results = this.filter();
    return Promise.resolve(results.length ? results : null).then(onFulfilled, onRejected);
  }
}

function createFakeKnex(data: TestRecord[]) {
  return jest.fn(() => new FakeQueryBuilder(data));
}

class TestRepository extends KnexRepository<TestRecord> {
  constructor(manager: DatabaseManager) {
    super(manager);
  }
  getTableName() {
    return "test";
  }
}

describe("KnexRepository", () => {
  let data: TestRecord[];
  let repo: TestRepository;
  beforeEach(() => {
    data = [];
    idCounter = 1;
    const fakeKnex = createFakeKnex(data);
    const mockDb = { getInstance: jest.fn(() => fakeKnex) };
    const mockManager = {
      getDatabase: jest.fn(() => mockDb),
    } as unknown as DatabaseManager;
    repo = new TestRepository(mockManager);
  });

  describe("create", () => {
    it("inserts and returns the new record", async () => {
      const result = await repo.create({ name: "Alice" });
      expect(result).toEqual({ id: "1", name: "Alice" });
      expect(data).toHaveLength(1);
    });
  });

  describe("findById", () => {
    it("returns the record when found", async () => {
      const created = await repo.create({ name: "Bob" });
      const found = await repo.findById(created.id);
      expect(found).toEqual(created);
    });

    it("throws when not found", async () => {
      await expect(repo.findById("99")).rejects.toThrow("does not exist");
    });
  });

  describe("findByField", () => {
    it("returns records matching the field", async () => {
      await repo.create({ name: "Tom" });
      await repo.create({ name: "Tom" });
      const found = await repo.findByField("name", "Tom");
      expect(found).toHaveLength(2);
    });

    it("throws when none found", async () => {
      await expect(repo.findByField("name", "Missing")).rejects.toThrow("does not exist");
    });
  });

  describe("update", () => {
    it("updates the record", async () => {
      const created = await repo.create({ name: "Old" });
      const updated = await repo.update(created.id, { name: "New" });
      expect(updated).toEqual({ id: created.id, name: "New" });
    });

    it("throws when trying to update id", async () => {
      const created = await repo.create({ name: "User" });
      await expect(repo.update(created.id, { id: "2" } as any)).rejects.toThrow(
        "Updating 'id' is not allowed",
      );
    });

    it("throws when record is missing", async () => {
      await expect(repo.update("42", { name: "None" })).rejects.toThrow("does not exist");
    });
  });

  describe("deleteById", () => {
    it("removes the record", async () => {
      const created = await repo.create({ name: "Del" });
      const result = await repo.deleteById(created.id);
      expect(result).toBe(true);
      expect(data).toHaveLength(0);
    });

    it("throws when record does not exist", async () => {
      await expect(repo.deleteById("55")).rejects.toThrow("does not exist");
    });
  });
});
