import { Routes } from '@angular/router';

import { AuthGuard } from '@sinequa/atomic-angular';

import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { LoadingComponent } from '@/core/components/loading/loading.component';
import { LoginComponent } from '@/core/components/login/login.component';

import { InitializationGuard } from '@sinequa/atomic-angular';
import { queryNameResolver } from '@sinequa/atomic-angular';

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