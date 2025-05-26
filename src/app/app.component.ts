import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NgxSonnerToaster } from 'ngx-sonner';

import { ApplicationStore, BackdropComponent, DrawerStackComponent, UserSettingsStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent],
  templateUrl: './app.component.html',
  styles: [
    `
      #navbar-logo {
        content: var(--logo-small) / var(--logo-alt-text);
      }
    `
  ]
})
export class AppComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly applicationStore = inject(ApplicationStore);

  constructor() {
    this.setupApplicationLanguage();
    this.applicationStore.updateReadyState(true);
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }
}
