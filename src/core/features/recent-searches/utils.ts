import { ExprFilter, LegacyFilter } from "@sinequa/atomic";

/**
 * Count the number of filters in a filter object
 * @param filters Filters to count
 * @returns Number of filters
 */
export function countFilters(filters: (LegacyFilter | LegacyFilter[] | ExprFilter) | undefined): number {
  if (!filters) return 0;

  if (Array.isArray(filters))
    return filters.reduce((acc, filter) => acc + countFilters(filter), 0);

  if (Array.isArray(filters.filters))
    return filters.filters.reduce((acc, filter) => acc + countFilters(filter as LegacyFilter), 0);

  return (filters as LegacyFilter).values?.length || !!(filters as LegacyFilter).value ? 1 : 0;
}

/**
 * Wraps filters in an array for backward compatibility
 * @param filters Filters to wrap
 * @returns Wrapped filters
 */
export function wrapFiltersToArray(filters: (LegacyFilter | LegacyFilter[] | ExprFilter) | undefined): any[] | undefined {
  if (!filters) return undefined;

  if (!Array.isArray(filters)) return [filters];

  return filters;
}