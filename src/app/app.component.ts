import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NgxSonnerToaster } from 'ngx-sonner';

/* TODO: to remove after v18 miggration */
import { LoginService } from '@sinequa/core/login';

import { isAuthenticated } from '@sinequa/atomic';
import { ApplicationService, ApplicationStore, BackdropComponent, DrawerStackComponent, UserSettingsStore } from '@sinequa/atomic-angular';
import { RobotIconComponent } from '@sinequa/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent, RobotIconComponent],
  templateUrl: './app.component.html',
  styles: [
    `
      #logo {
        content: var(--logo-small) / var(--logo-small-alt-text);
      }
    `
  ]
})
export class AppComponent {
  private readonly applicationService = inject(ApplicationService);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);

  private readonly router = inject(Router);

  // SBA dependencies for the Assistant
  private readonly loginService = inject(LoginService);
  private readonly applicationStore = inject(ApplicationStore);

  constructor() {
    addEventListener('authenticated', (event: Event) => {
      const customEvent = event as CustomEvent;

      const { authenticated } = customEvent.detail;
      if (authenticated) {
        this.initApplication();
      }
    });

    // used to works with the old Sinequa login service and the Assistant component
    // Maybe this can be removed in the future
    this.loginService.login().subscribe(values => {
      this.applicationStore.updateAssistantReady();
    });

    if (isAuthenticated()) {
      this.initApplication();

      if (this.router.url === '/error') {
        this.router.navigate(['/']);
      }
    }
  }

  initApplication() {
    this.applicationService
      .initAndCreateRoutes()
      .then(() => {
        this.setupApplicationLanguage();
        this.applicationStore.updateReadyState(true);
      })
      .catch(err => {
        console.error('Error initializing application', err);
        this.applicationStore.updateReadyState(false);
      });
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }
}
