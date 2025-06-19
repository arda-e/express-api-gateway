import { BenchmarkManager } from "../decorators/common/BenchmarkManager";

describe("BenchmarkManager", () => {
  let benchmarkManager: BenchmarkManager;
  let originalLogger: any;
  let mockLogger: { info: jest.Mock };

  // Set up fake timers for the entire test suite
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    benchmarkManager = new BenchmarkManager();

    // Mock logger
    originalLogger = (benchmarkManager as any).logger;
    mockLogger = { info: jest.fn() } as any;
    (benchmarkManager as any).logger = mockLogger;
  });

  afterEach(() => {
    // Restore logger
    (benchmarkManager as any).logger = originalLogger;
    jest.clearAllMocks();
  });

  describe("start", () => {
    it("should initialize startTime", () => {
      // Mock process.hrtime.bigint to return a specific value
      jest.spyOn(process.hrtime, "bigint").mockReturnValue(BigInt(1000));

      const result = benchmarkManager.start();

      // Should set the startTime property
      expect((benchmarkManager as any).startTime).toBe(BigInt(1000));

      // Should return this for chaining
      expect(result).toBe(benchmarkManager);
    });
  });

  describe("end", () => {
    it("should calculate duration and log it", () => {
      // Setup the hrtime.bigint mock to return sequential values
      const mockHrtime = jest.spyOn(process.hrtime, "bigint");
      mockHrtime.mockReturnValueOnce(BigInt(5000000)); // start time (5ms)
      mockHrtime.mockReturnValueOnce(BigInt(105000000)); // end time (105ms)

      // Start the benchmark
      benchmarkManager.start();

      // End the benchmark
      benchmarkManager.end("testMethod");

      // Verify logger.info was called with the correct message
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[Benchmark] Method "testMethod" took 100.00 ms',
      );
    });

    it("should throw error if start() was not called", () => {
      expect(() => benchmarkManager.end("testMethod")).toThrow("Benchmark not started");
    });
  });
});
