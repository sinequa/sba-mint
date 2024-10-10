import { Data, Route } from '@angular/router';

import { AuthGuard } from '@sinequa/atomic-angular';

import { LoadingComponent } from '@/core/components/loading/loading.component';
import { LoginComponent } from '@/core/features/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';

import { InitializationGuard, queryNameResolver } from '@sinequa/atomic-angular';
import { SearchAllComponent } from './pages/search/all/search-all.component';

import { ErrorComponent } from '@/core/components/error/error.component';

// Extended types to add custom properties to routes
type ExtendedData = Data & {
  queryName?: string;
  display?: string;
  wsQueryTab?: string;
  iconClass?: string;
  [key: string | symbol]: any;
}
type ExtendedRoute = Route & {
  data?: ExtendedData;
  children?: ExtendedRoutes;
}
type ExtendedRoutes = ExtendedRoute[];

export const routes: ExtendedRoutes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver } },
  {
    path: 'search', component: SearchComponent, canActivate: [AuthGuard(), InitializationGuard()], resolve: { queryName: queryNameResolver },
     children: [
      { path: 'all', component: LoadingComponent },
      { path: '**', redirectTo: 'all', pathMatch: 'full' }
    ]
  },
  { path: 'loading', component: LoadingComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];