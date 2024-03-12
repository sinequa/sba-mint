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
    name: queryName,
    isFirstPage: true
  };
}

export function buildPreviewQuery(query?: Partial<Query>): Query {
  assertInInjectionContext(buildPreviewQuery);

  const queryName = query?.name ?? getQueryNameFromRoute() ?? FALLBACK_DEFAULT_QUERY_NAME;

  return { name: queryName, text: query?.text };
}

export function getQueryTextFromUrl(url: string): string {
  return decodeURIComponent(url?.split('?')?.[1]?.split('&')?.find(value => value.startsWith('q='))?.split('=')?.[1] ?? '');
}

