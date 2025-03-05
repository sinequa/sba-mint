import { Data, Route } from '@angular/router';

import { AuthGuard, InitializationGuard, queryNameResolver } from '@sinequa/atomic-angular';

import { ErrorComponent } from '@/core/components/error/error.component';
import { LoadingComponent } from '@/core/components/loading/loading.component';

import { AssistantLayoutComponent } from './pages/assistant/assistant.layout';
import { BookmarksComponent } from './pages/bookmarks/bookmarks.component';
import { HomeComponent } from './pages/home/home.component';
import { RecentSearchesComponent } from './pages/recent-searches/recent-searches.component';
import { SearchComponent } from './pages/search/search.component';
import { SignInComponent } from '@/core/features/sign-in/sign-in';

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
  { path: 'assistant', component: AssistantLayoutComponent, canActivate: [AuthGuard(), InitializationGuard()] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver } },
  { path: 'recent-searches', component: RecentSearchesComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver } },
  { path: 'bookmarks', component: BookmarksComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver } },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard(), InitializationGuard()],
    resolve: { queryName: queryNameResolver },
    children: [
      { path: 'all', component: LoadingComponent },
      { path: '**', redirectTo: 'all', pathMatch: 'full' }
    ]
  },
  { path: 'loading', component: LoadingComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
