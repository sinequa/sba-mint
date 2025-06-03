import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { CCApp, getHelpIndexUrl } from '@sinequa/atomic';
import { AppStore, PrincipalStore } from '@sinequa/atomic-angular';
import { cn, SidebarComponent, SidebarItemComponent } from '@sinequa/ui';

import { APP_FEATURES } from '../../tokens';
import { UserMenuComponent } from '../user-menu/user-menu';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, SidebarComponent, SidebarItemComponent, UserMenuComponent],
  templateUrl: './sidebar.component.html'
})
export class AppSidebarComponent {
  cn = cn;
  private readonly appStore = inject(AppStore);
  private readonly principalStore = inject(PrincipalStore);
  private readonly transloco = inject(TranslocoService);
  private readonly appFeatures = inject(APP_FEATURES);

  readonly isAdmin = computed(() => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin);

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

  openAdmin() {
    window.open(`${window.location.origin}/admin`, '_blank', 'noopener');
  }
}
