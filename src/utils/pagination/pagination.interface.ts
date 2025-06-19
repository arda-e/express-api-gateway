export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IPaginator {
  buildResult<T>(data: T[], total: number, page?: number, limit?: number): PaginationResult<T>;
}
