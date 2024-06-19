import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { getState } from '@ngrx/signals';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { CCApp, login } from '@sinequa/atomic';
import { AuthGuard } from '@sinequa/atomic-angular';

import { DrawerStackComponent } from '@/core/components/drawer-stack/drawer-stack.component';
import { BackdropComponent } from '@/core/components/drawer/components/backdrop/backdrop.component';

import { InitializationGuard } from '@sinequa/atomic-angular';
import { ApplicationService, NavigationService } from '@sinequa/atomic-angular';
import { AppStore, ApplicationStore, PrincipalStore, QueryParamsStore } from '@sinequa/atomic-angular';

import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchComponent } from './pages/search/search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);
  appStore = inject(AppStore);
  applicationStore = inject(ApplicationStore);
  queryParamsStore = inject(QueryParamsStore);

  router = inject(Router);
  navigationService = inject(NavigationService);

  constructor() {
    // Login and initialize the application when the user is logged in
    login().then(value => {
      if (value) {
        this.appService.init().then(() => {
          const { fullName, name } = getState(this.principalStore).principal;

          this.createRoutes();

          toast(`Welcome back ${fullName || name}!`, { duration: 2000 })
          this.applicationStore.updateReadyState();

        });
      }
    }).catch(error => {
      toast.error("An error occured while logging in", { description: error, duration: 2000 });
    });
  }

  /**
   * Creates dynamic routes based on the Queries's tabs and updates the router configuration.
   */
  private createRoutes() {
    // Now we can create the dynamic routes based on the Queries's tabs
    const { queries } = getState(this.appStore) as CCApp;
    const array = Object.entries(queries).map(([key, value]) => ({ key, ...value }));

    // We need to create a route for each tab in each query
    // if a query has no tabs, we create a route with the query name as the tab name
    const tabs = array.map(item => ({ tabs: item.tabSearch.tabs || [{name: item.name}], queryName: item.name }));

    // We need to remove the current search route from the router config
    // the route exists in the router config because it was created in the app-routing.module.ts and we need it
    // to be able to navigate to the search page. We will recreate it with the new tabs
    const currentConfig = this.router.config.filter(route => route.path !== 'search');

    // create the children routes for the search route
    const children = tabs.map(item => item.tabs.map(tab => ({ path: tab.name, component: SearchAllComponent, data: { queryName: item.queryName, display: tab.name } }))).flat();
    const searchPath = this.router.config.find(route => route.path === 'search')
      || { path: 'search', component: SearchComponent, canActivate: [AuthGuard(), InitializationGuard()], children: [] };

    searchPath.component = SearchComponent;
    searchPath.children = [...children, { path: '**', redirectTo: 'all', pathMatch: 'full' }];

    const newConfig = [searchPath, ...currentConfig];
    // finally we reset the router config with the new routes
    this.router.resetConfig(newConfig);
  }
}