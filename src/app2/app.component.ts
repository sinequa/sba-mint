import { Component, DestroyRef, computed, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
import { LoggerService } from "@sinequa/agent";
import { ApplicationStore, FeatureFlagsDialogComponent, MultiSelectionToolbarComponent, UserSettingsStore } from "@sinequa/atomic-angular";
import { DialogService, SidebarInsetComponent, SidebarProviderComponent, SidebarTriggerComponent } from "@sinequa/ui";
import { QueryClient } from "@tanstack/angular-query-experimental";
import { ExternalToast, NgxSonnerToaster, toast } from "ngx-sonner";
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
    SidebarTriggerComponent
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

  private readonly currentUrl = injectCurrentUrl();
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

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches }) => {
      document.documentElement.classList.toggle("dark", matches);
    });

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
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage("en");

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? "en");
  }

  onUpdatedCollections(): void {
    this.queryClient.invalidateQueries();
  }
}
