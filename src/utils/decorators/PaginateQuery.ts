import { Request } from "express";
import { Knex } from "knex";

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function PaginateQuery() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request | undefined = args.find((a) => a && typeof a === "object" && "query" in a);

      if (!req || typeof req.query !== "object") {
        throw new Error("@PaginateQuery requires an Express Request object");
      }

      let page = parseInt((req.query as any).page ?? "1", 10);
      let limit = parseInt((req.query as any).limit ?? "10", 10);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const baseQuery: Knex.QueryBuilder = originalMethod.apply(this, args);

      if (
        !baseQuery ||
        typeof baseQuery.clone !== "function" ||
        typeof baseQuery.limit !== "function"
      ) {
        throw new Error("@PaginateQuery method must return a Knex QueryBuilder");
      }

      const offset = (page - 1) * limit;
      const dataQuery = baseQuery.clone().limit(limit).offset(offset);
      const countQuery = baseQuery.clone().count("*", { as: "total" }).first();

      const [data, countResult] = await Promise.all([dataQuery, countQuery]);
      const total = Number((countResult as any)?.total ?? 0);
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      } as PaginationResult<any>;
    };

    return descriptor;
  };
}
