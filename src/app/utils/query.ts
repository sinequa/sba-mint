import { assertInInjectionContext, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Query } from '@sinequa/atomic';

import { FALLBACK_DEFAULT_QUERY_NAME } from '@/app/config/query-names';

export function getQueryNameFromRoute(): string | undefined {
  assertInInjectionContext(getQueryNameFromRoute);

  const route = inject(ActivatedRoute);

  const recursive = (route: ActivatedRoute): string | undefined => {
    if (route?.firstChild) return recursive(route.firstChild);
    if (route?.snapshot.data['queryName']) return route.snapshot.data['queryName'];

    return undefined;
  }

  return recursive(route);
}

/**
 * Returns the object query parameters from the given URL
 *
 * @param url
 * @returns
 *
 * @example
 * ```typescript
 * const url = 'https://example.com/search?q=hello&f=type:document';
 * const rawQueryParams = queryParamsFromUrl(url);
 *
 * console.log(rawQueryParams);
 *
 * ^// Output: {q:'hello', f:'type:document', ...}
 * ```
 */
export function queryParamsFromUrl(url: string): Record<string, string> {
  const str = url.split('?')[1] || url;
  const params = (new URLSearchParams(str));
  return Object.fromEntries(params as unknown as Iterable<[string, string]>);
}

/**
 * Retrieves the query text from a URL.
 * @param url - The URL containing the query text.
 * @returns The decoded query text.
 */
export function getQueryTextFromUrl(url: string): string {
  const {q: queryText} = queryParamsFromUrl(url);
  return decodeURIComponent(queryText);
}

/**
 * Retrieves the ID from the given URL.
 * @param url - The URL from which to extract the ID.
 * @returns The decoded ID.
 */
export function getIdFromUrl(url: string): string {
  const {id} = queryParamsFromUrl(url);

  return decodeURIComponent(id);
}

/**
 * Retrieves the page number from the given URL query string.
 *
 * @param url - The URL containing the query string.
 * @returns The page number parsed from the query string.
 */
export function getQueryPageFromUrl(url: string): number {
  const {p: page} = queryParamsFromUrl(url);

  return parseInt(page, 10);
}

/**
 * Builds a query object based on the provided partial query.
 * If any properties are missing in the partial query, default values are used.
 *
 * @param query - The partial query object.
 * @returns The complete query object.
 */
export function buildQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildQuery);



  const name = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;
  const text = query?.text ?? getQueryTextFromUrl(window.location.toString()) ?? '';
  const filters = query?.filters ?? undefined;
  const page = query?.page ?? getQueryPageFromUrl(window.location.toString()) ?? undefined;

  return {
    ...query,
    name,
    text,
    filters,
    page
  };
}

/**
 * Builds a query object for the first page.
 * If a query object is provided, it will be merged with the default query object.
 * If no query object is provided, a default query object will be created.
 * The `name` property of the query object will be set to the provided query's name,
 * or if not provided, it will be set to the query name obtained from the route,
 * or if not available, it will be set to a fallback default query name.
 * The `isFirstPage` property of the query object will be set to `true`.
 *
 * @param query - Optional partial query object to be merged with the default query object.
 * @returns The query object for the first page.
 */
export function buildFirstPageQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildFirstPageQuery);

  const queryName = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;

  return {
    ...query,
    name: queryName,
    isFirstPage: true
  };
}

/**
 * Builds a preview query object based on the provided query parameters.
 * If no query is provided, it uses default values.
 *
 * @param query - The partial query object containing the query parameters.
 * @returns The built preview query object.
 */
export function buildPreviewQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildPreviewQuery);

  const queryName = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;

  return {
    ...query,
    name: queryName,
    text: query?.text
  };
}
