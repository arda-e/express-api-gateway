import { IPaginator, PaginationResult } from "./pagination.interface";

export abstract class BasePaginator implements IPaginator {
  constructor(protected defaultLimit = 10) {}

  protected sanitizePage(page?: number): number {
    return page && page > 0 ? page : 1;
  }

  protected sanitizeLimit(limit?: number): number {
    return limit && limit > 0 ? limit : this.defaultLimit;
  }

  abstract buildResult<T>(
    data: T[],
    total: number,
    page?: number,
    limit?: number,
  ): PaginationResult<T>;
}
