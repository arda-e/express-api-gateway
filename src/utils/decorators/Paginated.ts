import { container } from "tsyringe";
import { Paginator, PaginationResult } from "@utils/pagination";

export function Paginated() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [page, limit, ...rest] = args;
      const result = await originalMethod.apply(this, args);

      if (result && typeof result === "object" && "data" in result && "total" in result) {
        const paginator = container.resolve(Paginator);
        return paginator.buildResult(
          result.data,
          result.total,
          page,
          limit,
        ) as PaginationResult<unknown>;
      }

      return result;
    };

    return descriptor;
  };
}
