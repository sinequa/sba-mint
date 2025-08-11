import { Data, Route } from '@angular/router';

import { AuthGuard, ErrorComponent, LoadingComponent, queryNameResolver, SignInComponent } from '@sinequa/atomic-angular';

import { HomeComponent } from './pages/home/home.component';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchLayoutComponent } from './pages/search/layout';

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
    loadComponent: () => import('./pages/assistant/assistant.layout').then(m => m.AssistantLayoutComponent),
    canActivate: [AuthGuard()],
    resolve: { queryName: queryNameResolver }
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard()], resolve: { queryName: queryNameResolver } },
  {
    path: 'widgets',
    loadComponent: () => import('./pages/widgets/layout').then(m => m.WidgetsLayoutComponent),
    canActivate: [AuthGuard()],
    children: [
      {
        path: 'recent-searches',
        loadComponent: () => import('./pages/widgets/recent-searches/recent-searches.component').then(m => m.RecentSearchesComponent)
      },
      {
        path: 'bookmarks',
        loadComponent: () => import('./pages/widgets/bookmarks/bookmarks.component').then(m => m.BookmarksComponent)
      },
      {
        path: 'saved-searches',
        loadComponent: () => import('./pages/widgets/saved-searches/saved-searches.component').then(m => m.SavedSearchesComponent)
      },
      {
        path: 'collections',
        loadComponent: () => import('./pages/widgets/collections/collections.component').then(m => m.CollectionsComponent)
      }
    ]
  },
  {
    path: 'search',
    component: SearchLayoutComponent,
    canActivate: [AuthGuard()],
    children: [
      {
        path: '**',
        component: SearchAllComponent,
        resolve: { queryName: queryNameResolver }
      }
    ]
  },
  { path: 'ui-tester', loadComponent: () => import('./pages/ui-tester/ui-tester').then(m => m.UITesterComponent) },
  { path: 'loading', component: LoadingComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
