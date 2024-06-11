import { SpellingCorrectionMode } from "@sinequa/atomic";
import { Filter } from "./models";
import { queryParamsFromUrl } from "./query";

/**
 * `path`: hash of the search without the bang in form of `/search/all`
 * `text`: search text of the query
 * `filters`: filters associated to the query
 * `id`: document id if there's one opened
 * `page`: page number of the search
 * `sort`: sorting choice name
 */
export type QueryParams = {
  path?: string;
  text?: string;
  filters?: Filter[];
  id?: string;
  page?: number;
  sort?: string;
  spellingCorrectionMode?: SpellingCorrectionMode;
}

/**
 * Get {@link QueryParams} from url string
 *
 * @param url string to parse
 * @returns {@link QueryParams} or undefined
 */
export function getQueryParamsFromUrl(url: string | undefined): QueryParams | undefined {
  if (url === undefined) return undefined;

  const { q, f, p, s } = queryParamsFromUrl(url);
  const [path] = url.split('?');

  return {
    path,
    text: q,
    filters: f ? getFiltersFromURI(f) : undefined,
    page: parseInt(p, 10),
    sort: s
  };
}

/**
 * Get {@link Filter} array from query params string
 *
 * @param queryParams string to parse
 * @returns {@link Filter} array
 */
export function getFiltersFromUrl(queryParams: string | undefined): Filter[] {
  if (queryParams === undefined) return [];

  const { f: encodedFilters } = queryParamsFromUrl(queryParams);
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

/**
 * Returns whether the search `QueryParams` are equals according to:
 * - `path`
 * - `text`
 * - `filters`
 *
 * @param previous Previous state of the search `QueryParams`
 * @param current Current state of the search `QueryParams`
 * @returns `true` if the search `QueryParams` are equals according to
 * criteria, `false` otherwise
 */
export function areSearchQueryParamsEquals(previous: QueryParams | undefined, current: QueryParams | undefined): boolean {
  if (previous === current) return true;

  const prev = JSON.stringify({ path: previous?.path, text: previous?.text, filters: previous?.filters ?? [] });
  const curr = JSON.stringify({ path: current?.path, text: current?.text, filters: current?.filters ?? [] });

  return prev === curr;
}