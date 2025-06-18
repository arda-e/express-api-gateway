import "reflect-metadata";
import DatabaseManager from "../db.manager";

jest.mock("../knex.adapter", () => {
  const initializeMock = jest.fn();
  const closeMock = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      initialize: initializeMock,
      close: closeMock,
    })),
    initializeMock,
    closeMock,
  };
});

const {
  default: KnexAdapter,
  initializeMock,
  closeMock,
} = jest.requireMock("../knex.adapter") as {
  default: jest.Mock;
  initializeMock: jest.Mock;
  closeMock: jest.Mock;
};

describe("DatabaseManager", () => {
  let manager: DatabaseManager;

  beforeEach(() => {
    jest.clearAllMocks();
    initializeMock.mockReset();
    closeMock.mockReset();
    manager = new DatabaseManager(2, 10);
  });

  it("initializes database successfully", async () => {
    const db = await manager.createDatabase();

    expect(KnexAdapter).toHaveBeenCalledTimes(1);
    expect(initializeMock).toHaveBeenCalledTimes(1);
    expect(manager.getDatabase()).toBe(db);
  });

  it("handles concurrent initialization", async () => {
    initializeMock.mockImplementation(() => new Promise((res) => setTimeout(res, 10)));
    const [db1, db2] = await Promise.all([manager.createDatabase(), manager.createDatabase()]);

    expect(KnexAdapter).toHaveBeenCalledTimes(1);
    expect(initializeMock).toHaveBeenCalledTimes(1);
    expect(db1).toBe(db2);
  });

  it("throws on initialization failure", async () => {
    const error = new Error("fail");
    initializeMock.mockRejectedValue(error);

    await expect(manager.createDatabase()).rejects.toThrow("Database initialization failed: fail");
    await expect(manager.createDatabase()).rejects.toThrow(error);

    expect(KnexAdapter).toHaveBeenCalledTimes(1);
    expect(initializeMock).toHaveBeenCalledTimes(1);
  });

  it("getDatabase throws before initialization and returns after", async () => {
    expect(() => manager.getDatabase()).toThrow("Database instance has not been created yet.");
    await manager.createDatabase();
    expect(manager.getDatabase()).toBeDefined();
  });

  it("close resets state and calls adapter close", async () => {
    await manager.createDatabase();
    await manager.close();

    expect(closeMock).toHaveBeenCalledTimes(1);

    await manager.createDatabase();

    expect(KnexAdapter).toHaveBeenCalledTimes(2);
    expect(initializeMock).toHaveBeenCalledTimes(2);
  });
});
