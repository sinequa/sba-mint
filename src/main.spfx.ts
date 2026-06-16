import { inject, mergeApplicationConfig, runInInjectionContext } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { getState } from "@ngrx/signals";
import { error, info, initializeAadHttpClient, setGlobalConfig, warn } from "@sinequa/atomic";
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
import { AAD_RESOURCE_URI, AAD_TOKEN_PROVIDER, type MintSpfxContext } from "./config/spfx-context";
import { createMockSpfxContext } from "./config/spfx-context.mock";
import { environment } from "./environments/environment";

Object.assign(Datepicker.locales, fr, de);

setGlobalConfig(environment);

/**
 * keyux configuration
 */
startKeyUX(window, [hotkeyKeyUX(), focusGroupKeyUX(), pressKeyUX("is-pressed"), jumpKeyUX(), hiddenKeyUX()]);

// Le web part hôte SPFx doit renseigner ce contexte AVANT de charger le bundle (cf. spfx-context.ts).
let spfxContext = (globalThis as unknown as { __MINT_SPFX_CONTEXT__?: MintSpfxContext }).__MINT_SPFX_CONTEXT__;

// DEV uniquement : sous `ng serve` (build spfx) sans hôte SharePoint, on fabrique un contexte mocké
// pointant vers le mock backend du playground (cf. spfx-context.mock.ts). Jamais en production.
if (!spfxContext && !environment.production) {
  warn("[spfx] Aucun contexte hôte — utilisation d'un contexte SPFx mocké (DEV, playground).");
  spfxContext = createMockSpfxContext();
}

if (!spfxContext) {
  error("[spfx] Contexte SPFx manquant : le web part hôte doit définir window.__MINT_SPFX_CONTEXT__ (AadHttpClient + AadTokenProvider + resourceUri) avant de charger ce bundle.");
  localStorage.setItem("errorMessage", JSON.stringify({ message: "Missing SPFx context (window.__MINT_SPFX_CONTEXT__)." }));
  window.location.href = "assets/error/500.html";
} else {
  // 0) Le web part hôte est la source de vérité pour backendUrl/app en prod (cf. spfx-context.ts).
  //    Dans SharePoint, window.location.origin ≠ Sinequa et il n'y a pas de proxy → sans backendUrl
  //    les api/v1/* partiraient vers le site SharePoint.
  if (spfxContext.backendUrl || spfxContext.app) {
    setGlobalConfig({
      ...(spfxContext.backendUrl ? { backendUrl: spfxContext.backendUrl } : {}),
      ...(spfxContext.app ? { app: spfxContext.app } : {})
    });
  }

  // 1) Canal web-api de la librairie → AadHttpClient.
  initializeAadHttpClient(spfxContext.aadHttpClient);

  // 2) Canal HttpClient Angular → fourni à l'interceptor AAD via DI.
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
