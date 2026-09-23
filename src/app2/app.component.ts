import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, computed, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterOutlet } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
import { LoggerService } from "@sinequa/agent";
import { error, isAuthenticated } from "@sinequa/atomic";
import { ApplicationStore, FeatureFlagsDialogComponent, MultiSelectionToolbarComponent, UserSettingsStore } from "@sinequa/atomic-angular";
import { DialogService, SidebarInsetComponent, SidebarProviderComponent, SidebarTriggerComponent } from "@sinequa/ui";
import { QueryClient } from "@tanstack/angular-query-experimental";
import { ExternalToast, NgxSonnerToaster, toast } from "ngx-sonner";
import { HeaderExtrasService } from "@services/header-extras.service";
import { MainSidebarComponent } from "./components/sidebar";
import { injectCurrentUrl } from "../utils/routing";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    MainSidebarComponent,
    NgxSonnerToaster,
    MultiSelectionToolbarComponent,
    SidebarProviderComponent,
    SidebarInsetComponent,
    SidebarTriggerComponent,
    NgTemplateOutlet
  ],
  providers: [LoggerService],
  templateUrl: "./app.component.html"
})
export class AppComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly applicationStore = inject(ApplicationStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = inject(QueryClient);
  private readonly dialogService = inject(DialogService);
  protected readonly headerExtras = inject(HeaderExtrasService);

  private readonly currentUrl = injectCurrentUrl();
  // Active interface language. Every entry point that changes it (the two user menus and the
  // user-profile form in atomic-angular) goes through `TranslocoService.setActiveLang`, so
  // `langChanges$` is the single source of truth. `langChanges$` replays the current value on
  // subscription, so the initialValue is only a typing formality.
  private readonly activeLang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });
  // Routes that render without the application chrome (no sidebar): auth screens and the error page.
  protected readonly isChromelessRoute = computed(() => /^\/(login|logout|auth|error)/.test(this.currentUrl() ?? ""));

  constructor() {
    this.setupApplicationLanguage();
    this.applicationStore.updateReadyState(true);

    const controller = new AbortController();

    // Listen for custom notifications and display them using ngx-sonner
    addEventListener(
      "notification",
      (event: Event) => {
        const customEvent = event as CustomEvent<{
          type: "success" | "warning" | "info" | "error";
          title?: string;
          message: string;
          options?: ExternalToast;
        }>;
        const { type, message, options } = customEvent.detail;
        toast[type](message, options);
      },
      { signal: controller.signal }
    );

    // Keep the `dark` class in sync with the persisted theme preference (ES-32024).
    //
    // The class must be applied REACTIVELY, not only once at bootstrap. On a credentials
    // logout → login the stores are re-initialized via `ApplicationService.initialize()` WITHOUT a
    // full page reload (logout does `router.navigate(['/logout'])`, not `location.href`), so the
    // one-shot toggle in `main.ts` never re-runs. Binding to `isDarkMode()` — which tracks the
    // persisted `userTheme` — guarantees the checked mode is always the applied one, on first
    // login, after re-login and after a user override.
    effect(() => {
      document.documentElement.classList.toggle("dark", this.userSettingsStore.isDarkMode());
    });

    // Keep `<html lang>` in sync with the interface language (RGAA 8.4, ES-32640).
    //
    // `index.html` ships a static `lang="en"` that only covers the bootstrap phase; it must not
    // stay "en" once the user picks another language, otherwise screen readers keep applying
    // English pronunciation rules to a French (or German) interface. The language can change
    // without a page reload — and, like the `dark` class above, it is also re-applied after a
    // credentials logout → login, which re-initializes the stores without reloading the page.
    effect(() => {
      document.documentElement.lang = this.activeLang();
    });

    // React to OS scheme changes only when the user defers to the system ("system" mode). In
    // explicit "dark"/"light" mode the user's choice wins and must not be overridden by the OS.
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      ({ matches }) => {
        if (this.userSettingsStore.userTheme?.() === "system") {
          document.documentElement.classList.toggle("dark", matches);
        }
      },
      { signal: controller.signal }
    );

    // Ctrl+Shift+F opens the feature-flags dialog. Chosen to avoid browser/OS conflicts: not bound by
    // Chrome/Firefox/Edge (unlike Ctrl+Shift+K = Firefox console), no AltGr (Ctrl+Alt) clash on AZERTY,
    // and not Alt+Shift (Windows keyboard-layout switch). The dialog gates its own content to admins,
    // so the shortcut stays unconditional here — non-admins just see the "admin only" notice.
    addEventListener(
      "keydown",
      (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && !event.altKey && event.key.toLowerCase() === "f") {
          event.preventDefault();
          void this.dialogService.open(FeatureFlagsDialogComponent);
        }
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => controller.abort());
  }

  private setupApplicationLanguage() {
    // Persisting the "en" default is only meaningful once a session exists: AppComponent is
    // constructed as soon as bootstrapApp() resolves, whatever the authentication outcome, so this
    // can run before (or during) an OAuth/SAML redirect — writing here raced that handshake and
    // fired an unauthenticated `PATCH usersettings` (401, confirmed via a HAR capture on a slow
    // connection). The active Transloco language still gets a local fallback either way.
    if (this.userSettingsStore.language?.() === undefined && isAuthenticated()) {
      this.userSettingsStore.updateLanguage("en").catch(err => error("update language failed", err));
    }

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? "en");
  }

  onUpdatedCollections(): void {
    this.queryClient.invalidateQueries();
  }
}
