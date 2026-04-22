import { Location } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { CCApp, getHelpIndexUrl } from "@sinequa/atomic";
import { AppStore, PrincipalStore, UserSettingsStore } from "@sinequa/atomic-angular";
import {
  CommentIcon,
  cn,
  GearIcon,
  MagnifyingGlassIcon,
  QuestionCircleIcon,
  SidebarComponent,
  SidebarItemComponent
} from "@sinequa/ui";

/**
 * Sidebar component for the application.
 * @deprecated used with previous layout using the Drawer component
 */
@Component({
  selector: "app-sidebar",
  imports: [
    RouterLink,
    SidebarComponent,
    SidebarItemComponent,
    MagnifyingGlassIcon,
    CommentIcon,
    GearIcon,
    QuestionCircleIcon
  ],
  templateUrl: "./sidebar.component.html"
})
export class AppSidebarComponent {
  cn = cn;
  private readonly appStore = inject(AppStore);
  private readonly appFeatures = this.appStore.general()?.features;
  private readonly principalStore = inject(PrincipalStore);
  private readonly transloco = inject(TranslocoService);
  private readonly userSettings = inject(UserSettingsStore);
  protected readonly location = inject(Location);
  private readonly router = inject(Router);

  readonly backLevel = input<number | undefined>(undefined);

  readonly isAdmin = computed(
    () => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin
  );
  readonly isDarkMode = computed(() => this.userSettings.isDarkMode());

  readonly instanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-standalone-assistant`;
    }
    return `standalone-assistant`;
  });

  // Updated allowAI computed signal
  protected readonly allowAI = computed(() => {
    return !this.router.url.startsWith("/assistant") && !!this.appStore.isAssistantAllowed(this.instanceId());
  });

  openHelp() {
    const url = getHelpIndexUrl(this.transloco.getActiveLang(), {
      folder: "mint-search",
      path: "/r/_sinequa/webpackages/help",
      indexFile: "olh-index.html",
      useLocale: true,
      useLocaleAsPrefix: true
    });
    window.open(url, "_blank", "noopener");
  }

  switchDarkMode() {
    document.documentElement.classList.toggle("dark", !this.isDarkMode());
    this.userSettings.toggleDarkMode();
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, "_blank", "noopener");
  }
}
