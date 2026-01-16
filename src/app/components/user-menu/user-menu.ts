import { Component, computed, inject, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { globalConfig, logout, setGlobalConfig } from '@sinequa/atomic';
import {
  AppStore,
  OverrideUserDialogComponent,
  PrincipalStore,
  ResetUserSettingsDialogComponent,
  UserSettingsStore,
  UserProfileDialog
} from '@sinequa/atomic-angular';
import {
  AvatarComponent,
  AvatarFallbackComponent,
  AvatarImageComponent,
  ChevronRightIcon,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  Separator,
  UserIcon
} from '@sinequa/ui';

const THEME = ['light', 'dark', 'system'] as const;
type Theme = (typeof THEME)[number];

@Component({
  selector: 'app-user-menu',
  imports: [
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    UserIcon,
    ChevronRightIcon,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent,
    Separator,
    UserProfileDialog
  ],
  templateUrl: './user-menu.html',
  providers: [provideTranslocoScope('user-menu')]
})
export class UserMenuComponent {
  AllThemes: { name: Theme; icon: string }[] = [
    { name: 'light', icon: 'fa-fw fal fa-sun-bright' },
    { name: 'dark', icon: 'fa-fw fal fa-moon' },
    { name: 'system', icon: 'fa-fw fal fa-desktop' }
  ] as const;

  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);
  readonly userProfileDialog = viewChild(UserProfileDialog);

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

  readonly currentTheme = computed(() => this.userSettingsStore.userTheme());

  switchTheme(mode: Theme) {
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

  handleUserProfile() {
    this.userProfileDialog()?.open();
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
