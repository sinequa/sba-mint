import { Aggregation, Filter as ApiFilter, ExprFilter, InFilter } from '@sinequa/atomic';
import { Filter } from '@/app/utils/models';

export function translateFiltersToApiFilters(filters: Filter[], aggregations?: Aggregation[]): ApiFilter | ApiFilter[] | undefined {
  if (filters.length === 0) return undefined;
  else if (filters.length === 1) return translateFilterToApiFilter(filters[0], aggregations);
  else return translateFiltersToAndFilters(filters, aggregations);
}

export function translateFilterToApiFilter(filter: Filter, aggregations?: Aggregation[]): ApiFilter | undefined {
  if (filter.values.length === 0) return undefined;
  else if (filter.values.length === 1) return translateFilterToSimpleFilter(filter, aggregations);
  else return translateFilterToInFilter(filter, aggregations);
}

export function translateFiltersToAndFilters(filters: Filter[], aggregations?: Aggregation[]): ExprFilter | undefined {
  if (filters.length === 0) return undefined;

  const inFilters = filters.filter((f: Filter) => f.values.length > 1);
  const basicFilters = filters.filter((f: Filter) => f.values.length === 1);

  const translatedInFilters = inFilters.map((f: Filter) => translateFilterToInFilter(f, aggregations));
  const translatedBasicFilters = basicFilters.map((f: Filter) => translateFilterToSimpleFilter(f, aggregations));

  return {
    operator: 'and',
    filters: [...translatedInFilters, ...translatedBasicFilters]
  };
}

export function translateFiltersToOrFilters(filters: Filter[], aggregations?: Aggregation[]): ExprFilter | undefined {
  if (filters.length === 0) return undefined;

  const inFilters = filters.filter((f: Filter) => f.values.length > 1);
  const basicFilters = filters.filter((f: Filter) => f.values.length === 1);

  const translatedInFilters = inFilters.map((f: Filter) => translateFilterToInFilter(f, aggregations));
  const translatedBasicFilters = basicFilters.map((f: Filter) => translateFilterToSimpleFilter(f, aggregations));

  return {
    operator: 'or',
    filters: [...translatedInFilters, ...translatedBasicFilters]
  };
}

export function translateFilterToInFilter(filter: Filter, aggregations?: Aggregation[]): InFilter {
  const values = translateFilterToTreepathIfNeeded(filter, aggregations);

  return {
    operator: 'in',
    field: filter.column,
    values: values
  };
}

export function translateFilterToSimpleFilter(filter: Filter, aggregations?: Aggregation[]): ApiFilter {
  const values = translateFilterToTreepathIfNeeded(filter, aggregations);

  return {
    field: filter.column,
    value: values[0]
  };
}

export function translateFilterToTreepathIfNeeded(filter: Filter, aggregations?: Aggregation[]): string[] {
  if (!aggregations) return filter.values;

  const isTree = aggregations.find((a: Aggregation) => a.column === filter.column)?.isTree;

  if (!isTree) return filter.values;

  return filter.values.map((value: string) => `/${value}/*`);
}
