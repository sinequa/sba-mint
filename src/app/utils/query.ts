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
 * Returns the raw query parameters from the given URL
 * 
 * @param url 
 * @returns 
 * 
 * @example
 * ```typescript
 * const url = 'https://example.com/search?q=hello&f=type:document';
 * const rawQueryParams = getRawQueryParamsFromUrl(url);
 * 
 * console.log(rawQueryParams);
 * 
 * // Output: ['q=hello', 'f=type:document']
 * ```
 */
function getRawQueryParamsFromUrl(url: string): string[] {
  return url?.split('?')?.[1]?.split('&');
}

export function getQueryTextFromUrl(url: string): string {
  const rawQueryText = getRawQueryParamsFromUrl(url)?.find(value => value.startsWith('q='));
  const queryText = rawQueryText?.split('=')?.[1] ?? '';

  return decodeURIComponent(queryText);
}

export function getIdFromUrl(url: string): string {
  const rawId = getRawQueryParamsFromUrl(url)?.find(value => value.startsWith('id='));
  const id = rawId?.split('=')?.[1] ?? '';

  return decodeURIComponent(id);
}

export function buildQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildQuery);

  const queryName = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;
  const queryText = query?.text ?? getQueryTextFromUrl(window.location.toString()) ?? '';
  const queryFilters = query?.filters ?? undefined;

  return {
    ...query,
    name: queryName,
    text: queryText,
    filters: queryFilters
  };
}

export function buildFirstPageQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildFirstPageQuery);

  const queryName = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;

  return {
    ...query,
    name: queryName,
    isFirstPage: true
  };
}

export function buildPreviewQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildPreviewQuery);

  const queryName = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;

  return {
    ...query,
    name: queryName,
    text: query?.text
  };
}
