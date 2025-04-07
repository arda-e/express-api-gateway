import "reflect-metadata";
import { BENCHMARK_METADATA_KEY } from "../Benchmark";
import { LOGGER_METADATA_KEY } from "../Logger";
import { CUSTOM_RESPONSE_HANDLING_KEY } from "../CustomResponse";

export const CONTROLLER_METADATA_KEY = Symbol("controller");

/**
 * Retrieves the controller methods that should be wrapped
 */
export function getControllerMethods(target: any): string[] {
  return Object.getOwnPropertyNames(target.prototype).filter(
    (prop) => typeof target.prototype[prop] === "function" && prop !== "constructor",
  );
}

/**
 * Checks if a method has custom response handling
 */
export function hasCustomResponseHandling(target: any, methodName: string): boolean {
  return !!Reflect.getMetadata(CUSTOM_RESPONSE_HANDLING_KEY, target.prototype, methodName);
}

/**
 * Determines if benchmarking should be applied to a method
 */
export function shouldBenchmarkMethod(
  target: any,
  methodName: string,
  globalBenchmarking: boolean,
): boolean {
  return (
    globalBenchmarking ||
    !!Reflect.getMetadata(BENCHMARK_METADATA_KEY, target.prototype, methodName)
  );
}

/**
 * Determines if logging should be applied to a method
 */
export function shouldLogMethod(target: any, methodName: string, globalLogging: boolean): boolean {
  return globalLogging || !!Reflect.getMetadata(LOGGER_METADATA_KEY, target.prototype, methodName);
}
