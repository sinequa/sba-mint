import { Routes } from '@angular/router';

import { AuthGuard } from '@sinequa/atomic-angular';

import { LoadingComponent } from '@/core/features/loading.component';
import { LoginComponent } from '@/core/features/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';

import { InitializationGuard, queryNameResolver } from '@sinequa/atomic-angular';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard(), InitializationGuard()] },
  {
    path: 'search', component: SearchComponent, canActivate: [AuthGuard(), InitializationGuard()], children: [
      { path: 'all', component: LoadingComponent, resolve: { queryName: queryNameResolver } },
      { path: '**', redirectTo: 'all', pathMatch: 'full' }
    ]
  },
  { path: 'loading', component: LoadingComponent  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];