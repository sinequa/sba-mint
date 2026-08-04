import { NgComponentOutlet, NgTemplateOutlet } from "@angular/common";
import { Component, computed, effect, inject, model, output, signal, Type, untracked, viewChild, viewChildren } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Placement } from "@floating-ui/dom";
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";
import { AGENT_INSTANCE_ID, AgentsStore } from "@sinequa/agent";
import { error, globalConfig, logout, setGlobalConfig } from "@sinequa/atomic";
import { AppStore, OverrideUserDialogComponent, PrincipalStore, ResetUserSettingsDialogComponent, UserSettingsStore } from "@sinequa/atomic-angular";
import {
  ArrowRightFromBracketIcon,
  ArrowUpRightFromSquareIcon,
  BreakpointObserverService,
  CheckIcon,
  ChevronRightIcon,
  DebugIcon,
  DesktopIcon,
  FlagEnglishIcon,
  FlagFrenchIcon,
  FlagGermanIcon,
  KeyIcon,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  MoonIcon,
  PaletteIcon,
  Separator,
  SunBrightIcon,
  SwitchComponent,
  TrashIcon,
  UserIcon,
  UserSecretIcon
} from "@sinequa/ui";
import { injectCurrentUrl } from "../../utils/routing";

const THEME = ["light", "dark", "system"] as const;
type Theme = (typeof THEME)[number];

const SUPPORTED_LANGUAGES = ["en", "fr", "de"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

@Component({
  selector: "sidebar-user-menu-content",
  imports: [
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    ChevronRightIcon,
    Separator,
    NgComponentOutlet,
    DebugIcon,
    SwitchComponent,
    UserIcon,
    ArrowUpRightFromSquareIcon,
    KeyIcon,
    ArrowRightFromBracketIcon,
    UserSecretIcon,
    CheckIcon,
    PaletteIcon,
    TrashIcon,
    NgTemplateOutlet
  ],
  templateUrl: "./sidebar-user-menu.html",
  providers: [provideTranslocoScope("user-menu")]
})
export class SidebarUserMenuComponent {
  AllThemes: { name: Theme; icon: Type<unknown> }[] = [
    { name: "light", icon: SunBrightIcon },
    { name: "dark", icon: MoonIcon },
    { name: "system", icon: DesktopIcon }
  ] as const;

  AllLanguages: { code: SupportedLanguage; label: string; icon: Type<unknown> }[] = [
    { code: "en", label: "English", icon: FlagEnglishIcon },
    { code: "fr", label: "Français", icon: FlagFrenchIcon },
    { code: "de", label: "Deutsch", icon: FlagGermanIcon }
  ] as const;

  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);

  protected readonly principalStore = inject(PrincipalStore);
  protected readonly agentsStore = inject(AgentsStore);
  private readonly router = inject(Router);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly transloco = inject(TranslocoService);
  protected readonly isMobile = inject(BreakpointObserverService).isMobile;

  private readonly currentUrl = injectCurrentUrl();
  readonly isAgentRoute = computed(() => this.currentUrl()?.startsWith("/chat") ?? false);
  agentInstanceId = inject(AGENT_INSTANCE_ID);
  allowAgent = computed(() => this.appStore.isAgentAllowed(this.agentInstanceId) && this.isAgentRoute());

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
  readonly debug = model(this.userSettingsStore.isDebugMode());

  readonly menuPosition = computed<Placement>(() => (this.isMobile() ? "bottom-start" : "left-start"));

  constructor() {
    // enable agent's debug mode
    effect(() => {
      const debug = this.debug();
      this.agentsStore.setDebugEnabled(debug);
      untracked(() => {
        this.userSettingsStore.setDebugMode(debug).catch(err => error("set debug mode failed", err));
      });
    });
  }

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang).catch(err => error("update langugage failed", err));

    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
      this.currentActiveLang.set(lang);
    }
  }

  switchTheme(mode: Theme) {
    const userTheme = mode === "dark" || (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", userTheme);
    this.userSettingsStore.setUserTheme(mode).catch(err => error("set user theme failed", err));
  }

  onChangePassword() {
    this.menus()?.forEach(m => {
      m?.close?.();
    });
    this.router.navigate(["/auth", "changepassword"]).catch(err => error("navigation to /auth failed", err));
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout()
      .then(redirectUrl => {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          this.router.navigate(["/logout"]);
        }
      })
      .catch(err => error("navigation to /logout failed", err));
  }

  onEventClick = output<"profile" | "reset-user-settings" | "override-user" | "revert-override-user" | undefined>();

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.open();
  }

  openSinequa() {
    window.open("https://sinequa.com", "_blank", "noopener");
  }
}
