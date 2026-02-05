import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { ExternalToast, NgxSonnerToaster, toast } from 'ngx-sonner';
import { QueryClient } from '@tanstack/angular-query-experimental';

import { ApplicationStore, MultiSelectionToolbarComponent, UserSettingsStore } from '@sinequa/atomic-angular';

import { SheetPreviewerComponent } from '@components/preview/sheet-previewer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, MultiSelectionToolbarComponent, SheetPreviewerComponent],
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
  private readonly queryClient = inject(QueryClient);

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

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
      document.documentElement.classList.toggle('dark', matches);
    });

    this.destroyRef.onDestroy(() => controller.abort());
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }

  onUpdatedCollections(): void {
    this.queryClient.invalidateQueries();
  }
}
