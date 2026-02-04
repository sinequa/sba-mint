import { Data, Route } from '@angular/router';

import { AuthGuard, ErrorComponent, LoadingComponent, queryNameResolver, SignInComponent } from '@sinequa/atomic-angular';

import { Home2Component } from './pages/home2/home';
import { SearchAll2Component } from './pages/search2/search-all';
import { SearchLayout2Component } from './pages/search2/search-layout';

// Extended types to add custom properties to routes
type ExtendedData = Data & {
  queryName?: string; // name of the query defined in the admin
  display?: string; // the label you want to display in the interface
  wsQueryTab?: string; // the name of the "tab" associated with the query you want to use
  icon?: string; // the icon you want to associate with the label in the interface
  [key: string | symbol]: any; // all the "custom" parameters you want
};
type ExtendedRoute = Route & {
  data?: ExtendedData;
  children?: ExtendedRoutes;
};
type ExtendedRoutes = ExtendedRoute[];

export const routes: ExtendedRoutes = [
  { path: 'login', component: SignInComponent },
  { path: 'logout', component: SignInComponent },
  {
    path: 'assistant',
    loadComponent: () => import('./pages/assistant2/assistant.layout').then(m => m.AssistantLayoutComponent),
    canActivate: [AuthGuard()],
    resolve: { queryName: queryNameResolver }
  },
  { path: 'home', component: Home2Component, canActivate: [AuthGuard()], resolve: { queryName: queryNameResolver } },
  {
    path: 'widgets',
    loadComponent: () => import('./pages/widgets/widgets-layout').then(m => m.WidgetsLayout2Component),
    canActivate: [AuthGuard()],
    children: [
      {
        path: 'recent-searches',
        loadComponent: () => import('../components/widgets/recent-searches/recent-searches.component').then(m => m.RecentSearchesComponent)
      },
      {
        path: 'bookmarks',
        loadComponent: () => import('../components/widgets/bookmarks/bookmarks.component').then(m => m.BookmarksComponent)
      },
      {
        path: 'saved-searches',
        loadComponent: () => import('../components/widgets/saved-searches/saved-searches.component').then(m => m.SavedSearchesComponent)
      },
      {
        path: 'collections',
        loadComponent: () => import('../components/widgets/collections/collections.component').then(m => m.CollectionsComponent)
      }
    ]
  },
  {
    path: 'search',
    component: SearchLayout2Component,
    canActivate: [AuthGuard()],
    children: [
      {
        path: '**',
        component: SearchAll2Component,
        resolve: { queryName: queryNameResolver }
      }
    ]
  },
  { path: 'loading', component: LoadingComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
