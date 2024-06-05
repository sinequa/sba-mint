import { assertInInjectionContext, inject } from '@angular/core';
import { ActivatedRoute, Routes } from '@angular/router';

import { AuthGuard, LoginComponent } from '@sinequa/atomic-angular';

import { InitializationGuard } from './guards/initializationGuard';
import { LoadingComponent } from './guards/loading.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchComponent } from './pages/search/search.component';
import { queryNameResolver } from './resolvers/query-name-resolver';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard()] },
  {
    path: 'search', component: SearchComponent, canActivate: [AuthGuard(), InitializationGuard()], children: [
      { path: 'all', component: SearchAllComponent, resolve: { queryName: queryNameResolver } },
      { path: '**', redirectTo: 'all', pathMatch: 'full' }
    ]
  },
  { path: 'loading', component: LoadingComponent  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

export const FALLBACK_SEARCH_ROUTE = '/search/all';
export const SEARCH_ROUTES = ['/search'];

export function isASearchRoute(url: string): boolean {
  return SEARCH_ROUTES.some(route => url.startsWith(route));
}

/**
 * Returns the current tab
 * @returns The current tab
 */
export function getCurrentTab(): string | undefined {
  assertInInjectionContext(getCurrentTab);

  const route = inject(ActivatedRoute);

  return route?.snapshot.url.toString();
}

/**
 * Returns the current query name
 * @returns The current query name
 */
export function getCurrentQueryName(): string | undefined {
  assertInInjectionContext(getCurrentQueryName);

  const tab = getCurrentTab();

  return routes.find(r => r.path === 'search')?.children?.find(r => r.path === tab)?.data?.['queryName'];
}