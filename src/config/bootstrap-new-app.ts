import { inject, runInInjectionContext } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { getState } from "@ngrx/signals";
import { error } from "@sinequa/atomic";
import { UserSettingsStore } from "@sinequa/atomic-angular";
import { AppComponent } from "../app2/app.component";
import { appConfig } from "../app2/app.config";

export function bootstrapNewApp() {
  bootstrapApplication(AppComponent, appConfig)
    .then(appRef => {
      // Set the dark mode class based on user settings
      runInInjectionContext(appRef.injector, () => {
        const { userTheme } = getState(inject(UserSettingsStore)) as any;
        const isDarkMode = userTheme === "dark" || (userTheme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDarkMode);
      });
    })
    .catch(err => {
      // this catch is triggered when the bootstrapApplication fails, for example when the appConfig is not valid
      error("bootstrapApplication error:", err);

      localStorage.setItem("errorMessage", JSON.stringify(err));
      // Redirect to the error page with the URL causing the error
      window.location.href = "assets/error.html";
    });
}
