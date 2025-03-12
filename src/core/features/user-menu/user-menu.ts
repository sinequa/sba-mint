import { Component, computed, inject, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { globalConfig, logout, setGlobalConfig } from '@sinequa/atomic';
import { PrincipalStore, UserSettingsStore } from '@sinequa/atomic-angular';

import {
  AvatarComponent,
  AvatarImageComponent,
  AvatarFallbackComponent,
  ChevronRightIconComponent,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  UserRoundIconComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  HorizontalDividerComponent
} from '@sinequa/ui';

import { OverrideUserDialogComponent } from '../dialogs/override-user.dialog';
import { ResetUserSettingsDialogComponent } from '../dialogs/reset-user-settings.dialog';
import { getHelpIndexUrl } from './help-folder-options';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    HorizontalDividerComponent,
    TranslocoPipe,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    FlagEnglishIconComponent,
    FlagFrenchIconComponent,
    UserRoundIconComponent,
    ChevronRightIconComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent
  ],
  templateUrl: './user-menu.html',
  providers: [provideTranslocoScope({ scope: 'user-menu', loader })]
})
export class UserMenuComponent {
  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);

  private readonly router = inject(Router);
  private readonly principalStore = inject(PrincipalStore);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);

  readonly user = computed(() => {
    const principal = getState(this.principalStore).principal;
    return principal;
  });

  readonly initials = computed(() => {
    const principal = this.user();
    const separator = principal.fullName ? ' ' : '.';
    return (principal.fullName || principal.name || '')
      .split(separator)
      .filter(word => word[0] && word[0] === word[0].toUpperCase())
      .map(word => word[0])
      .join('')
      .slice(0, 3);
  });

  readonly isAdmin = computed(() => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin);
  readonly allowUserOverride = computed(() => this.principalStore.allowUserOverride());
  readonly isOverridingUser = computed(() => this.principalStore.isOverridingUser());

  // used to hide the logout button when using SSO
  useCredentials = globalConfig.useCredentials;

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang);

    if (this.transloco.getActiveLang() !== lang) this.transloco.setActiveLang(lang);
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout().then(() => this.router.navigate(['/logout']));
  }

  handleOverride() {
    this.overrideUserDialog()?.showModal();
  }

  handleOverrideUser() {
    this.overrideUserDialog()?.handleOverrideUser();
  }

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.showModal();
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, '_blank', 'noopener');
  }

  openSinequa() {
    window.open('https://sinequa.com', '_blank', 'noopener');
  }

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
}
