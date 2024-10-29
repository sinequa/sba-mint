import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { globalConfig } from '@sinequa/atomic';
import { ApplicationService, UserSettingsStore } from '@sinequa/atomic-angular';

import { BackdropComponent } from '@/core/components/drawer/backdrop/backdrop.component';
import { DrawerStackComponent } from '@/core/components/drawer/drawer-stack/drawer-stack.component';

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
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);

  private readonly router = inject(Router);

  constructor() {
    // Login and initialize the application when the user is logged in
    const { useCredentials } = globalConfig;
    this.appService.register([
      {
        path: 'search',
        component: SearchComponent,
        isLayout: true,
      },
      {
        path: 'all',
        component: SearchAllComponent,
      }
    ]);

    this.appService.logMeIn().then((value) => {
      if (value) {
        this.setupApplicationLanguage();
      }
    }).catch((err) => {
      console.warn("An error occured while logging in (app component)", err);
      if (useCredentials) {
        this.router.navigate(['login']);
      }
      else if (err instanceof Response) {
        if(err.status === 401 || err.status === 403) {
          toast.error("You are not authorized to access this page");
        }
        if(err.status === 500) {
          toast.error("An error occured while processing your request");
          this.router.navigate(['error']);
        }
      }
      else {
        toast.error("An error occured while processing your request");
        this.router.navigate(['error']);
      }
    });
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined)
      this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }
}
