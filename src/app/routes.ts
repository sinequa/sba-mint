import { Data, Route } from '@angular/router';

import { AuthGuard, ErrorComponent, InitializationGuard, LoadingComponent, queryNameResolver, SignInComponent } from '@sinequa/atomic-angular';

import { AssistantLayoutComponent } from './pages/assistant/layout';
import { BookmarksComponent } from './pages/widgets/bookmarks/bookmarks.component';
import { HomeComponent } from './pages/home/home.component';
import { RecentSearchesComponent } from './pages/widgets/recent-searches/recent-searches.component';
import { SearchLayoutComponent } from './pages/search/search.layout';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SavedSearchesComponent } from './pages/widgets/saved-searches/saved-searches.component';

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
  { path: 'assistant', component: AssistantLayoutComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver } },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver } },

  // TODO: regroup these routes in a single one
  { path: 'recent-searches', component: RecentSearchesComponent, canActivate: [AuthGuard(), InitializationGuard()] },
  { path: 'bookmarks', component: BookmarksComponent, canActivate: [AuthGuard(), InitializationGuard()] },
  { path: 'saved-searches', component: SavedSearchesComponent, canActivate: [AuthGuard(), InitializationGuard()] },
  {
    path: 'search',
    component: SearchLayoutComponent,
    canActivate: [AuthGuard(), InitializationGuard()],
    resolve: { queryName: queryNameResolver },
    children: [
      { path: 'all', component: SearchAllComponent, resolve: { queryName: queryNameResolver } },
      { path: '**', redirectTo: 'all', pathMatch: 'full' }
    ]
  },
  { path: 'loading', component: LoadingComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
