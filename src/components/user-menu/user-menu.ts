import { Component, computed, inject, linkedSignal, signal, Type, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { logout, setGlobalConfig } from '@sinequa/atomic';
import {
  AppStore,
  OverrideUserDialogComponent,
  PrincipalStore,
  ResetUserSettingsDialogComponent,
  UserProfileDialog,
  UserProfileService,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import {
  AvatarComponent,
  AvatarFallbackComponent,
  AvatarImageComponent,
  ChevronRightIcon,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  Separator,
  UserIcon
} from '@sinequa/ui';

const THEME = ['light', 'dark', 'system'] as const;
type Theme = (typeof THEME)[number];

const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * User menu component
 * Displays a user menu with options to change language, theme, override user, reset settings, and logout.
 *
 * @example
 * ```html
 * <user-menu></user-menu>
 * ```
 */
@Component({
  selector: 'user-menu',
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

  AllLanguages: { code: SupportedLanguage; label: string; icon: Type<unknown> }[] = [
    { code: 'en', label: 'English', icon: FlagEnglishIconComponent },
    { code: 'fr', label: 'Français', icon: FlagFrenchIconComponent }
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
  private readonly userProfileService = inject(UserProfileService);

  readonly enabledUserProfile = computed(() => this.appStore.general()?.features?.userProfile?.enabled);

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

  readonly currentActiveLang = signal(this.transloco.getActiveLang());
  readonly currentTheme = computed(() => this.userSettingsStore.userTheme());

  protected principal = computed(() => this.principalStore.principal?.());
  protected userProfileResource = this.userProfileService.getUserProfile(this.principal);
  readonly userProfile = linkedSignal(() => {
    if (this.userProfileResource.hasValue()) {
      return this.userProfileResource.value();
    }
    return undefined;
  });
  readonly profilePhoto = computed(() => this.userProfile()?.data.profilePhoto || '');

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang);

    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
      this.currentActiveLang.set(lang);
    }
  }

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

  handleOverrideUser() {
    this.overrideUserDialog()?.handleOverrideUser();
  }

  handleUserProfile() {
    this.userProfileDialog()?.open();
  }

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.open();
  }

  openSinequa() {
    window.open('https://sinequa.com', '_blank', 'noopener');
  }
}
