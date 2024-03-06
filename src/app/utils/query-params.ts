import { Filter } from "./api-filter-translator";

export type QueryParams = {
  path?: string;
  text?: string;
  filters?: Filter[];
}

/**
 * Get {@link QueryParams} from url string
 * 
 * @param url string to parse
 * @returns {@link QueryParams} or undefined
 */
export function getQueryParamsFromUrl(url: string | undefined): QueryParams | undefined {
  if (url === undefined) return undefined;

  const [origin, paramString] = url.split('?');
  const params = paramString?.split('&');

  return {
    path: origin,
    text: decodeURIComponent(params?.find(param => param.startsWith('q='))?.split('=')[1] ?? ''),
    filters: getFiltersFromURI(params?.find(param => param.startsWith('f='))?.split('=')[1] ?? '[]')
  };
}

/**
 * Get {@link Filter} array from query params string
 * 
 * @param queryParams string to parse
 * @returns {@link Filter} array
 */
export function getFiltersFromQueryParams(queryParams: string | undefined): Filter[] {
  if (queryParams === undefined) return [];

  const encodedFilters = queryParams?.split('&').find(value => value.startsWith('f='))?.split('=')?.[1] ?? '[]';

  return getFiltersFromURI(encodedFilters);
}

/**
 * Get {@link Filter} array from uri string
 * 
 * @param uri string to parse
 * @returns {@link Filter} array
 */
export function getFiltersFromURI(uri: string): Filter[] {
  const filtersString = decodeURIComponent(uri);
  const filters = JSON.parse(filtersString ?? '[]');

  return filters;
}