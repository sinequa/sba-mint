import { inject, mergeApplicationConfig, runInInjectionContext } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { getState } from "@ngrx/signals";
import { error, info, setGlobalConfig, warn } from "@sinequa/atomic";
import { initializeAadHttpClient } from "@sinequa/atomic/spfx";
import { UserSettingsStore } from "@sinequa/atomic-angular";
import { focusGroupKeyUX, hiddenKeyUX, hotkeyKeyUX, jumpKeyUX, pressKeyUX, startKeyUX } from "keyux";
// datepicker i18n https://mymth.github.io/vanillajs-datepicker/#/i18n
import Datepicker from "vanillajs-datepicker/Datepicker";
// @ts-expect-error: missing types
import de from "vanillajs-datepicker/locales/de";
// @ts-expect-error: missing types
import fr from "vanillajs-datepicker/locales/fr";
import agent from "../node_modules/@sinequa/agent/package.json";
import atomic from "../node_modules/@sinequa/atomic/package.json";
import atomicAngular from "../node_modules/@sinequa/atomic-angular/package.json";
import { AppComponent } from "./app2/app.component";
import { appConfig } from "./app2/app.config";
import { AAD_RESOURCE_URI, AAD_TOKEN_PROVIDER, type MintSpfxContext } from "./config/spfx/spfx-context";
import { createMockSpfxContext } from "./config/spfx/spfx-context.mock";
import { environment } from "./environments/environment";

Object.assign(Datepicker.locales, fr, de);

setGlobalConfig(environment);

/**
 * keyux configuration
 */
startKeyUX(window, [hotkeyKeyUX(), focusGroupKeyUX(), pressKeyUX("is-pressed"), jumpKeyUX(), hiddenKeyUX()]);

// The SPFx host web part must set this context BEFORE loading the bundle (see spfx-context.ts).
let spfxContext = (globalThis as unknown as { __MINT_SPFX_CONTEXT__?: MintSpfxContext }).__MINT_SPFX_CONTEXT__;

// DEV only: under `ng serve` (spfx build) without a SharePoint host, fabricate a mocked context
// pointing at the playground mock backend (see spfx-context.mock.ts). Never in production.
if (!spfxContext && !environment.production) {
  warn("[spfx] No host context — using a mocked SPFx context (DEV, playground).");
  spfxContext = createMockSpfxContext();
}

if (!spfxContext) {
  error("[spfx] Missing SPFx context: the host web part must set window.__MINT_SPFX_CONTEXT__ (AadHttpClient + AadTokenProvider + resourceUri) before loading this bundle.");
  localStorage.setItem("errorMessage", JSON.stringify({ message: "Missing SPFx context (window.__MINT_SPFX_CONTEXT__)." }));
  window.location.href = "assets/error/500.html";
} else {
  // 0) The host web part is the source of truth for backendUrl/app in prod (see spfx-context.ts).
  //    In SharePoint, window.location.origin ≠ Sinequa and there is no proxy → without backendUrl
  //    the api/v1/* calls would go to the SharePoint site.
  if (spfxContext.backendUrl || spfxContext.app) {
    setGlobalConfig({
      ...(spfxContext.backendUrl ? { backendUrl: spfxContext.backendUrl } : {}),
      ...(spfxContext.app ? { app: spfxContext.app } : {})
    });
  }

  // 1) Library web-api channel → AadHttpClient.
  initializeAadHttpClient(spfxContext.aadHttpClient);

  // 2) Angular HttpClient channel → provided to the AAD interceptor via DI.
  const spfxConfig = mergeApplicationConfig(appConfig, {
    providers: [
      { provide: AAD_TOKEN_PROVIDER, useValue: spfxContext.aadTokenProvider },
      { provide: AAD_RESOURCE_URI, useValue: spfxContext.resourceUri }
    ]
  });

  bootstrapApplication(AppComponent, spfxConfig)
    .then(appRef => {
      // Set the dark mode class based on user settings
      runInInjectionContext(appRef.injector, () => {
        const { userTheme } = getState(inject(UserSettingsStore));
        const isDarkMode = userTheme === "dark" || (userTheme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDarkMode);
      });
    })
    .then(() => {
      info("atomic (spfx)", atomic.version);
      info("atomic-angular", atomicAngular.version);
      info("agent", agent.version);
    })
    .catch(err => {
      error("bootstrapApplication error:", err);
      localStorage.setItem("errorMessage", JSON.stringify(err));
      window.location.href = "assets/error/500.html";
    });
}
