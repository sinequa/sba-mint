import { assertInInjectionContext, inject } from '@angular/core';
import { ActivatedRoute, Routes } from '@angular/router';

import { AuthGuard, LoginComponent } from '@sinequa/atomic-angular';

import { DEFAULT_QUERY_NAME, PEOPLE_QUERY_NAME, SLIDES_QUERY_NAME } from './config/query-names';
import { DesignSystemComponent } from './pages/debug/design-system/design-system.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchMattersComponent } from './pages/search/matters/search-matters.component';
import { SearchPeopleComponent } from './pages/search/people/search-people.component';
import { SearchComponent } from './pages/search/search.component';
import { SearchSlidesComponent } from './pages/search/slides/search-slides.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard()] },
  {
    path: 'search', component: SearchComponent, canActivate: [AuthGuard()], children: [
      { path: 'all', component: SearchAllComponent, data: { queryName: DEFAULT_QUERY_NAME } },
      { path: 'people', component: SearchPeopleComponent, data: { queryName: PEOPLE_QUERY_NAME } },
      { path: 'slides', component: SearchSlidesComponent, data: { queryName: SLIDES_QUERY_NAME } },
      { path: 'matters', component: SearchMattersComponent, data: { queryName: DEFAULT_QUERY_NAME } },
      { path: '**', redirectTo: 'all', pathMatch: 'full' }
    ]
  },
  { path: 'debug/design-system', component: DesignSystemComponent },
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