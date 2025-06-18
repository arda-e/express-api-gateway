import knexConfig from "@config/knexfile";

const knexConstructor = jest.fn();

jest.mock("knex", () => {
  return {
    __esModule: true,
    default: jest.fn((config) => knexConstructor(config)),
  };
});

describe("KnexAdapter", () => {
  let KnexAdapter: any;
  let adapter: any;
  let rawMock: jest.Mock;
  let transactionMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "development";

    rawMock = jest.fn().mockResolvedValue("ok");
    transactionMock = jest.fn().mockResolvedValue("trx");
    knexConstructor.mockImplementation(() => ({ raw: rawMock, transaction: transactionMock }));

    ({ default: KnexAdapter } = require("../knex.adapter"));
    adapter = new KnexAdapter();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("initializes using knex and tests connection", async () => {
    await adapter.initialize();

    expect(knexConstructor).toHaveBeenCalledWith(knexConfig.development);
    expect(rawMock).toHaveBeenCalledWith("SELECT 1");
  });

  it("executes query with parameters", async () => {
    adapter["instance"] = { raw: rawMock };
    await adapter.query("SELECT * FROM table WHERE id = ?", [1]);

    expect(rawMock).toHaveBeenCalledWith("SELECT * FROM table WHERE id = ?", [1]);
  });

  it("throws if query called before initialization", async () => {
    await expect(adapter.query("SELECT 1")).rejects.toThrow(
      "Knex has not been initialized. Call initialize first.",
    );
  });

  it("createTransaction returns a transaction object", async () => {
    adapter["instance"] = { transaction: transactionMock };

    const trx = await adapter.createTransaction();

    expect(trx).toBe("trx");
    expect(transactionMock).toHaveBeenCalled();
  });
});
