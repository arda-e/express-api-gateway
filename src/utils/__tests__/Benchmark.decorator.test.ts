import "reflect-metadata";
import LoggerFactory from "@utils/Logger";

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
    const mockLogger = { info: jest.fn() } as any;
    const loggerSpy = jest.spyOn(LoggerFactory, "getLogger").mockReturnValue(mockLogger);

    await wrapper(req, res as any, next);

    expect(original).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Method "testMethod" took'),
    );

    loggerSpy.mockRestore();
  });

  it("does not log when benchmarking disabled", async () => {
    const original = jest.fn().mockResolvedValue("ok");
    const wrapper = createMethodWrapper(original, "testMethod", false, false);
    const req = { method: "GET", path: "/" } as any;
    const res = buildRes();
    const next = jest.fn();
    const mockLogger = { info: jest.fn() } as any;
    const loggerSpy = jest.spyOn(LoggerFactory, "getLogger").mockReturnValue(mockLogger);

    await wrapper(req, res as any, next);

    expect(mockLogger.info).not.toHaveBeenCalled();

    loggerSpy.mockRestore();
  });
});
