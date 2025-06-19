import LoggerFactory from "@utils/Logger";

export class BenchmarkManager {
  private startTime: bigint | null = null;
  private logger = LoggerFactory.getLogger();

  /**
   * Starts benchmarking
   */
  start(): this {
    this.startTime = process.hrtime.bigint();
    return this;
  }

  /**
   * Ends benchmarking and logs the duration
   */
  end(methodName: string): void {
    if (!this.startTime) throw new Error("Benchmark not started");
    const duration = Number(process.hrtime.bigint() - this.startTime) / 1_000_000;
    this.logger.info(`[Benchmark] Method "${methodName}" took ${duration.toFixed(2)} ms`);
  }
}
