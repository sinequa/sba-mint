import { NgComponentOutlet } from "@angular/common";
import { Component, computed, inject, signal, Type, viewChild, viewChildren } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { bootstrapNewApp } from "@config/bootstrap-new-app";
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";
import { globalConfig, logout, setGlobalConfig } from "@sinequa/atomic";
import {
  AppStore,
  OverrideUserDialogComponent,
  PrincipalStore,
  ResetUserSettingsDialogComponent,
  UserProfileDialog,
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
 * User menu component displayed in the top-right corner of the application.
 * It provides options for changing language, theme, overriding user settings, and logging out.
 * It also displays the user's initials or avatar.
 * @deprecated This component is deprecated and will be removed in future releases.
 */
@Component({
  selector: "app-user-menu",
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
    UserProfileDialog,
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

  private readonly router = inject(Router);
  private readonly principalStore = inject(PrincipalStore);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly features = inject(AppStore).general()?.features;
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
    const { editablePartition } = getState(this.principalStore);
    return allowChangePassword && useCredentials && editablePartition;
  });

  readonly enabledUserProfile = computed(() => this.appStore.general()?.features?.userProfile?.enabled);

  readonly user = computed(() => {
    const principal = getState(this.principalStore);
    return principal;
  });

  readonly initials = computed(() => {
    const principal = this.user();
    const separator = principal.fullName ? " " : ".";
    return (principal.fullName || principal.name || "")
      .split(separator)
      .filter((word) => word[0] && word[0] === word[0].toUpperCase())
      .map((word) => word[0])
      .join("")
      .slice(0, 3);
  });
  readonly allowUserOverride = computed(() => this.principalStore.allowUserOverride());
  readonly isOverridingUser = computed(() => this.principalStore.isOverridingUser());
  readonly allowNewUI = computed(() => this.features?.["newUI"]);

  readonly currentActiveLang = signal(this.transloco.getActiveLang());
  readonly currentTheme = computed(() => this.userSettingsStore.userTheme());

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang);

    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
      this.currentActiveLang.set(lang);
    }
  }

  switchTheme(mode: Theme) {
    const userTheme =
      mode === "dark" ||
      (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", userTheme);
    this.userSettingsStore.setUserTheme(mode);
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout().then(() => this.router.navigate(["/logout"]));
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

  handleNewLayout() {
    bootstrapNewApp();
  }

  openSinequa() {
    window.open("https://sinequa.com", "_blank", "noopener");
  }

  onChangePassword() {
    this.menus()?.forEach((m) => (m as any)?.close?.());
    this.router.navigate(["/auth", "changepassword"]);
  }
}
