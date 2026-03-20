import { NgComponentOutlet } from "@angular/common";
import { Component, computed, inject, output, signal, Type, viewChild, viewChildren } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { globalConfig, logout, setGlobalConfig } from "@sinequa/atomic";
import {
  AppStore,
  OverrideUserDialogComponent,
  PrincipalStore,
  ResetUserSettingsDialogComponent,
  UserSettingsStore
} from "@sinequa/atomic-angular";
import {
  ChevronRightIcon,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  Separator
} from "@sinequa/ui";

const THEME = ["light", "dark", "system"] as const;
type Theme = (typeof THEME)[number];

const SUPPORTED_LANGUAGES = ["en", "fr"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

@Component({
  selector: "sidebar-user-menu-content",
  imports: [FormsModule, MenuComponent, MenuContentComponent, MenuItemComponent, TranslocoPipe, ChevronRightIcon, Separator, NgComponentOutlet],
  templateUrl: "./sidebar-user-menu.html",
  providers: [provideTranslocoScope("user-menu")]
})
export class SidebarUserMenuComponent {
  AllThemes: { name: Theme; icon: string }[] = [
    { name: "light", icon: "fa-fw fal fa-sun-bright" },
    { name: "dark", icon: "fa-fw fal fa-moon" },
    { name: "system", icon: "fa-fw fal fa-desktop" }
  ] as const;

  AllLanguages: { code: SupportedLanguage; label: string; icon: Type<unknown> }[] = [
    { code: "en", label: "English", icon: FlagEnglishIconComponent },
    { code: "fr", label: "Français", icon: FlagFrenchIconComponent }
  ] as const;

  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);

  protected readonly principalStore = inject(PrincipalStore);
  private readonly router = inject(Router);
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

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang);

    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
      this.currentActiveLang.set(lang);
    }
  }

  switchTheme(mode: Theme) {
    const userTheme = mode === "dark" || (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", userTheme);
    this.userSettingsStore.setUserTheme(mode);
  }

  onChangePassword() {
    this.menus()?.forEach(m => {
      m?.close?.();
    });
    this.router.navigate(["/auth", "changepassword"]);
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout().then(() => this.router.navigate(["/logout"]));
  }

  onEventClick = output<"profile" | "reset-user-settings" | "override-user" | "revert-override-user" | undefined>();

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.open();
  }

  openSinequa() {
    window.open("https://sinequa.com", "_blank", "noopener");
  }
}
