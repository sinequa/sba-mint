import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

/* TODO: to remove after v18 miggration */
import { LoginService } from '@sinequa/core/login';

import { globalConfig, logout } from '@sinequa/atomic';
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
    logout();
    this.login();
  }

  async login() {
    // Login and initialize the application when the user is logged in
    const { useCredentials } = globalConfig;

    const success = await this.applicationService.autoSignIn().catch(err => {
      console.warn('An error occured while logging in (app component)', err);
      if (useCredentials) {
        this.router.navigate(['login']);
      } else if (err instanceof Response) {
        if (err.status === 401 || err.status === 403) {
          toast.error('You are not authorized to access this page');
        }
        if (err.status === 500) {
          toast.error('An error 500 occured while processing your request');
          this.router.navigate(['error'], { skipLocationChange: true });
        }
      } else {
        toast.error('An error occured while processing your request');
        this.router.navigate(['error'], { skipLocationChange: true });
      }
    });

    if (success) {
      this.setupApplicationLanguage();
      if (this.router.url === '/error') {
        this.router.navigate(['/']);
      } else {
        this.loginService.login().subscribe(values => {
          console.log('Login successful!', values);
          this.applicationStore.updateAssistantReady();
        });
      }
    } else {
      console.warn('An error occured while logging in (app component) after auto login');
      this.router.navigate(['error'], { skipLocationChange: true });
    }
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }
}
