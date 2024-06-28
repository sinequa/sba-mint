import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { getState } from '@ngrx/signals';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { CCApp, globalConfig, login } from '@sinequa/atomic';
import { AppStore, ApplicationService, ApplicationStore, AuthGuard, InitializationGuard, NavigationService, PrincipalStore, QueryParamsStore } from '@sinequa/atomic-angular';

import { DrawerStackComponent } from '@/core/components/drawer/drawer-stack/drawer-stack.component';
import { BackdropComponent } from '@/core/components/drawer/backdrop/backdrop.component';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchComponent } from './pages/search/search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly appService = inject(ApplicationService);
  private readonly principalStore = inject(PrincipalStore);
  private readonly appStore = inject(AppStore);
  private readonly applicationStore = inject(ApplicationStore);

  private readonly router = inject(Router);

  constructor() {
    // Login and initialize the application when the user is logged in
    const { useCredentials } = globalConfig;

    login().then(value => {
      if (value) {
        this.appService.initWithCreateRoutes(SearchComponent, SearchAllComponent).then(() => {
          const { fullName, name } = getState(this.principalStore).principal;

          toast(`Welcome back ${fullName || name}!`, { duration: 2000 })
          this.applicationStore.updateReadyState();

        }).catch((error: Error) => {
          toast.error("An error occured while initializing the application", { description: error.message, duration: 3000 });
        });
      }
    }).catch(error => {
      console.warn("An error occured while logging in", error);
      if (useCredentials) {
        this.router.navigate(['/login'])
      }
    });
  }

}