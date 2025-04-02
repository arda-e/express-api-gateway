export interface PostgresErrorConfig {
  passThroughErrors?: Array<new (...args: any[]) => Error>;
  codeMap?: Record<string, (error: any) => Error>;
  enableLogging?: boolean;
}
