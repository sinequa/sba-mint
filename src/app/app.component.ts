import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { ExternalToast, NgxSonnerToaster, toast } from 'ngx-sonner';

import { ApplicationStore, BackdropComponent, DrawerStackComponent, MultiSelectionToolbarComponent, UserSettingsStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent, MultiSelectionToolbarComponent],
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
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.setupApplicationLanguage();
    this.applicationStore.updateReadyState(true);

    const controller = new AbortController();

    // Listen for custom notifications and display them using ngx-sonner
    addEventListener(
      'notification',
      (event: Event) => {
        const customEvent = event as CustomEvent<{
          type: 'success' | 'warning' | 'info' | 'error';
          title?: string;
          message: string;
          options?: ExternalToast;
        }>;
        const { type, message, options } = customEvent.detail;
        toast[type](message, options);
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => controller.abort());
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }
}
