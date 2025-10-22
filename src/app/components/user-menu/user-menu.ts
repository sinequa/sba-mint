import { Component, computed, inject, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { globalConfig, logout, setGlobalConfig } from '@sinequa/atomic';
import { AppStore, OverrideUserDialogComponent, PrincipalStore, ResetUserSettingsDialogComponent, UserSettingsStore } from '@sinequa/atomic-angular';
import {
  AvatarComponent,
  AvatarFallbackComponent,
  AvatarImageComponent,
  ChevronRightIconComponent,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  HorizontalDividerComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  UserIcon
} from '@sinequa/ui';

@Component({
  selector: 'app-user-menu',
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
    UserIcon,
    ChevronRightIconComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent
  ],
  templateUrl: './user-menu.html',
  providers: [provideTranslocoScope('user-menu')]
})
export class UserMenuComponent {
  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);
  private readonly router = inject(Router);
  private readonly principalStore = inject(PrincipalStore);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly transloco = inject(TranslocoService);

  /**
   * Determines whether password change functionality should be enabled for the current user.
   *
   * This computed property evaluates two conditions:
   * - The application must be configured to use credentials authentication
   * - The password change feature must be explicitly enabled in the application settings
   *
   * @returns True if both credential authentication is enabled and the password change feature is allowed, false otherwise
   */
  readonly allowChangePassword = computed(() => {
    const { useCredentials } = globalConfig;
    const { allowChangePassword = false } = this.appStore.general()?.features || {};
    return allowChangePassword && useCredentials;
  });

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
  readonly allowUserOverride = computed(() => this.principalStore.allowUserOverride());
  readonly isOverridingUser = computed(() => this.principalStore.isOverridingUser());

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang);

    if (this.transloco.getActiveLang() !== lang) this.transloco.setActiveLang(lang);
  }

  switchTheme(mode: 'light' | 'dark' | 'system') {
    const userTheme = mode === 'dark' || (mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', userTheme);
    this.userSettingsStore.setUserTheme(mode);
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout().then(() => this.router.navigate(['/logout']));
  }

  handleOverride() {
    this.overrideUserDialog()?.open();
  }

  handleOverrideUser() {
    this.overrideUserDialog()?.handleOverrideUser();
  }

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.open();
  }

  openSinequa() {
    window.open('https://sinequa.com', '_blank', 'noopener');
  }

  onChangePassword() {
    this.menus()?.forEach(m => (m as any)?.close?.());
    this.router.navigate(['/auth', 'changepassword']);
  }
}
