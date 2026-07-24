import { Component, DestroyRef, effect, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
import { ExternalToast, NgxSonnerToaster, toast } from "ngx-sonner";

import { ApplicationStore, MultiSelectionToolbarComponent, UserSettingsStore, BackdropComponent, DrawerStackComponent } from "@sinequa/atomic-angular";
import { QueryClient } from "@tanstack/angular-query-experimental";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NgxSonnerToaster, MultiSelectionToolbarComponent, BackdropComponent, DrawerStackComponent],
  templateUrl: "./app.component.html",
  styles: [
    `
      #navbar-logo {
        content: var(--logo-small) / var(--logo-alt-text);
      }
    `
  ]
})
export class AppComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly applicationStore = inject(ApplicationStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = inject(QueryClient);

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
