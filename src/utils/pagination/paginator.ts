import { singleton } from "tsyringe";

import { BasePaginator } from "./base-paginator";
import { PaginationResult } from "./pagination.interface";

@singleton()
export class Paginator extends BasePaginator {
  buildResult<T>(data: T[], total: number, page?: number, limit?: number): PaginationResult<T> {
    const p = this.sanitizePage(page);
    const l = this.sanitizeLimit(limit);
    return { data, total, page: p, limit: l };
  }
}
