import "reflect-metadata";
import { createMethodWrapper } from "../decorators/Controller/method-wrapper";

describe("Benchmark Decorator via Controller wrapper", () => {
  const buildRes = () => ({
    headersSent: false,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs execution time when benchmarking enabled", async () => {
    const original = jest.fn().mockResolvedValue("ok");
    const wrapper = createMethodWrapper(original, "testMethod", true, false);
    const req = { method: "GET", path: "/" } as any;
    const res = buildRes();
    const next = jest.fn();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await wrapper(req, res as any, next);

    expect(original).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Method "testMethod" took'));

    logSpy.mockRestore();
  });

  it("does not log when benchmarking disabled", async () => {
    const original = jest.fn().mockResolvedValue("ok");
    const wrapper = createMethodWrapper(original, "testMethod", false, false);
    const req = { method: "GET", path: "/" } as any;
    const res = buildRes();
    const next = jest.fn();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await wrapper(req, res as any, next);

    expect(logSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
