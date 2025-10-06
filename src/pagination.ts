export interface IPaginationOptions {
  items: Array<any>;
  page: number; // Renamed from offset for clarity (1-based index)
  limit: number;
}

export interface IPaginationResult<T> {
  items: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number; // Renamed totalPage for standard camelCase
}
/**
 * Calculates pagination details and returns a slice of items for the specified page.
 *
 * @param items The array of all items.
 * @param page The current page number (1-based index).
 * @param limit The maximum number of items per page.
 * @returns An IPaginationResult object with paginated data and stats.
 */
export function TMPagination<T>(
  items: T[],
  page: number,
  limit: number
): IPaginationResult<T> {
  const defaultResult: IPaginationResult<T> = { items: [], page: 0, limit: 0, total: 0, totalPages: 0 };

  if (!items || items.length === 0 || limit <= 0) {
    return { ...defaultResult, items: items || [] };
  }

  const total = items.length;

  // Ensure limit is a positive integer
  const safeLimit = Math.max(1, Math.floor(limit));

  const totalPages = Math.ceil(total / safeLimit);

  // Ensure page is a valid 1-based index (min 1, max totalPages)
  const safePage = Math.max(1, Math.min(totalPages, Math.floor(page)));

  // Calculate the slice boundaries
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = safePage * safeLimit;

  // Slice the items
  const result = items.slice(startIndex, endIndex);

  return {
    items: result,
    page: safePage,
    limit: safeLimit,
    total: total,
    totalPages: totalPages
  };
}

export { };