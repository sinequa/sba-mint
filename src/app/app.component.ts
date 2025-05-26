import { Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { NgxSonnerToaster } from 'ngx-sonner';

import { RouterOutlet } from '@angular/router';
import { ApplicationStore, AppStore, BackdropComponent, DrawerStackComponent, UserSettingsStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent],
  templateUrl: './app.component.html',
  styles: [
    `
      #navbar-logo {
        content: var(--logo-small) / var(--logo-small-alt-text);
      }
    `
  ]
})
export class AppComponent {
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly transloco = inject(TranslocoService);

  private readonly title = inject(Title);

  private readonly applicationStore = inject(ApplicationStore);

  constructor() {
    effect(() => {
      const general = this.appStore.general();

      if (general) {
        if (general.name) {
          this.title.setTitle(general!.name);
        }
        if (general.logo?.light?.small) {
          document.documentElement.style.setProperty(`--logo-small`, `url(${general.logo?.light?.small})`);
        }
        if (general.logo?.light?.large) {
          document.documentElement.style.setProperty(`--logo-large`, `url(${general.logo?.light?.large})`);
        }
      }
    });

    this.setupApplicationLanguage();
    this.applicationStore.updateReadyState(true);
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }
}
