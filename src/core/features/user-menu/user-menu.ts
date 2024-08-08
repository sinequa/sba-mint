import { Component, computed, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { logout } from "@sinequa/atomic";
import { MenuComponent, MenuItemComponent, PrincipalStore } from "@sinequa/atomic-angular";
import { OverrideUserDialogComponent } from "../dialog/override";
import { ResetUserSettingsDialogComponent } from "../dialog/reset-user-settings";
import { getHelpIndexUrl } from "./help-folder-options";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [FormsModule, MenuComponent, MenuItemComponent, TranslocoPipe, OverrideUserDialogComponent, ResetUserSettingsDialogComponent],
  templateUrl: "./user-menu.html",
  providers: [provideTranslocoScope({ scope: "user-menu", loader })]
})
export class UserMenuComponent {
  readonly menu = viewChild(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);

  private readonly router = inject(Router);
  private readonly principalStore = inject(PrincipalStore);
  private readonly transloco = inject(TranslocoService);

  readonly user = computed(() => {
    const principal = getState(this.principalStore).principal;
    return principal;
  })

  readonly initials = computed(() => {
    const principal = this.user();
    const separator = principal.fullName ? ' ' : '.';
    return (principal.fullName || principal.name || '').split(separator).filter(word => word[0] && (word[0] === word[0].toUpperCase())).map(word => word[0]).join('').slice(0, 3);
  });

  readonly isAdmin = computed(() => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin);

  readonly allowUserOverride = computed(() => {
    return this.principalStore.allowUserOverride();
  })

  readonly isOverridingUser = computed(() => {
    return this.principalStore.isOverridingUser();
  })


  changeLanguage(lang: string) {
    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
    }
    this.menu()?.close();
  }

  handleLogout() {
    logout().then(() => this.router.navigate(['/logout']));
  }

  handleOverride() {
    this.menu()?.close();
    this.overrideUserDialog()?.showModal();
  }

  handleOverrideUser() {
    this.overrideUserDialog()?.handleOverrideUser();
  }

  handleResetUserSettings() {
    this.menu()?.close();
    this.resetUserSettingsDialog()?.showModal();
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, "_blank", 'noopener');
  }

  openSinequa() {
    window.open("https://sinequa.com", "_blank", 'noopener');
  }

  openHelp() {
    const url = getHelpIndexUrl(this.transloco.getActiveLang(), {
      folder: 'mint-search',
      path: '/r/_sinequa/webpackages/help',
      indexFile: 'olh-index.html',
      useLocale: true,
      useLocaleAsPrefix: true
    });
    window.open(url, "_blank", "noopener");
  }
}