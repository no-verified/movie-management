export type PaginatedResult<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
};
