import { NgComponentOutlet } from "@angular/common";
import { Component, computed, inject, linkedSignal, signal, Type, viewChild, viewChildren } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, ɵEmptyOutletComponent } from "@angular/router";
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { error, globalConfig, logout, setGlobalConfig } from "@sinequa/atomic";
import {
  AppStore,
  OverrideUserDialogComponent,
  PrincipalStore,
  ResetUserSettingsDialogComponent,
  UserProfileDialog,
  UserProfileService,
  UserSettingsStore
} from "@sinequa/atomic-angular";
import {
  ArrowRightFromBracketIcon,
  ArrowUpRightFromSquareIcon,
  AvatarComponent,
  AvatarFallbackComponent,
  AvatarImageComponent,
  CheckIcon,
  ChevronRightIcon,
  DesktopIcon,
  DialogService,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  KeyIcon,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  MoonIcon,
  Separator,
  SunBrightIcon,
  TrashIcon,
  UserIcon,
  UserSecretIcon
} from "@sinequa/ui";

const THEME = ["light", "dark", "system"] as const;
type Theme = (typeof THEME)[number];

const SUPPORTED_LANGUAGES = ["en", "fr"] as const;
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
  selector: "user-menu",
  imports: [
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    UserIcon,
    UserSecretIcon,
    ChevronRightIcon,
    CheckIcon,
    TrashIcon,
    KeyIcon,
    ArrowUpRightFromSquareIcon,
    ArrowRightFromBracketIcon,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent,
    Separator,
    NgComponentOutlet
  ],
  templateUrl: "./user-menu.html",
  providers: [provideTranslocoScope("user-menu")]
})
export class UserMenuComponent {
  AllThemes: { name: Theme; icon: Type<unknown> }[] = [
    { name: "light", icon: SunBrightIcon },
    { name: "dark", icon: MoonIcon },
    { name: "system", icon: DesktopIcon }
  ] as const;

  AllLanguages: { code: SupportedLanguage; label: string; icon: Type<unknown> }[] = [
    { code: "en", label: "English", icon: FlagEnglishIconComponent },
    { code: "fr", label: "Français", icon: FlagFrenchIconComponent }
  ] as const;

  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);
  readonly userProfileDialog = viewChild(UserProfileDialog);

  protected readonly principalStore = inject(PrincipalStore);
  private readonly router = inject(Router);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly transloco = inject(TranslocoService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly dialogService = inject(DialogService);

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
    if (this.enabledUserProfile()) return false;
    const { useCredentials } = globalConfig;
    const { allowChangePassword = false } = this.appStore.general()?.features || {};
    const { editablePartition } = getState(this.principalStore);
    return allowChangePassword && useCredentials && editablePartition;
  });

  readonly enabledUserProfile = computed(() => this.appStore.general()?.features?.userProfile?.enabled);
  readonly allowUserOverride = computed(() => this.principalStore.allowUserOverride());
  readonly isOverridingUser = computed(() => this.principalStore.isOverridingUser());

  readonly currentActiveLang = signal(this.transloco.getActiveLang());
  readonly currentTheme = computed(() => this.userSettingsStore.userTheme());

  protected userProfileResource = this.userProfileService.getUserProfile(!this.enabledUserProfile() ? signal(undefined) : this.principalStore.userId);
  readonly userProfile = linkedSignal(() => {
    if (this.userProfileResource.hasValue()) {
      return this.userProfileResource.value();
    }
    return undefined;
  });
  readonly profilePhoto = computed(() => this.userProfile()?.data.profilePhoto || "");

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang).catch(err => error("update language failed!", err));

    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
      this.currentActiveLang.set(lang);
    }
  }

  switchTheme(mode: Theme) {
    const userTheme = mode === "dark" || (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", userTheme);
    this.userSettingsStore.setUserTheme(mode).catch(err => error("set user theme failed!", err));
  }

  onChangePassword() {
    this.menus()?.forEach(m => {
      m?.close?.();
    });
    this.router.navigate(["/auth", "changepassword"]).catch(err => error("navigation to /auth failed!", err));
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout()
      .then(() => this.router.navigate(["/logout"]))
      .catch(err => error("navigation to /logout failed!", err));
  }

  handleOverride() {
    this.overrideUserDialog()?.open();
  }

  handleOverrideUser() {
    this.overrideUserDialog()?.handleOverrideUser();
  }

  handleUserProfile() {
    this.dialogService.open(UserProfileDialog).catch(err => error("open user profile dialog failed!", err));
  }

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.open();
  }

  openSinequa() {
    window.open("https://sinequa.com", "_blank", "noopener");
  }
}
