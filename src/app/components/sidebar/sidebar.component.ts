import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { CCApp, getHelpIndexUrl } from '@sinequa/atomic';
import { APP_FEATURES, AppStore, PrincipalStore, UserSettingsStore } from '@sinequa/atomic-angular';
import { cn, SidebarComponent, SidebarItemComponent } from '@sinequa/ui';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, SidebarComponent, SidebarItemComponent],
  templateUrl: './sidebar.component.html'
})
export class AppSidebarComponent {
  cn = cn;
  private readonly appStore = inject(AppStore);
  private readonly principalStore = inject(PrincipalStore);
  private readonly transloco = inject(TranslocoService);
  private readonly appFeatures = inject(APP_FEATURES);
  private readonly userSettings = inject(UserSettingsStore);
  protected readonly location = inject(Location);

  readonly showBack = input<boolean>(false);

  readonly isAdmin = computed(() => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin);
  readonly isDarkMode = computed(() => this.userSettings.useDarkMode());
  readonly instanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-standalone-assistant`;
    } else {
      return 'standalone-assistant';
    }
  });

  // Updated allowAI computed signal
  protected readonly allowAI = computed(() => {
    return !!this.appStore.isAssistantAllowed(this.instanceId());
  });

  openHelp() {
    const url = getHelpIndexUrl(this.transloco.getActiveLang(), {
      folder: 'mint-search',
      path: '/r/_sinequa/webpackages/help',
      indexFile: 'olh-index.html',
      useLocale: true,
      useLocaleAsPrefix: true
    });
    window.open(url, '_blank', 'noopener');
  }

  switchDarkMode() {
    document.documentElement.classList.toggle('dark', !this.isDarkMode());
    this.userSettings.toggleDarkMode();
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, '_blank', 'noopener');
  }

  back() {
    this.location.back();
    setTimeout(() => {
      this.location.back();
    }, 100);
  }
}
