import { InjectionToken } from "@angular/core";
import type { AadHttpClient, AadTokenProvider } from "@microsoft/sp-http";

/**
 * Contract that the SPFx host web part must provide BEFORE loading the mint bundle
 * (`spfx` build), via `window.__MINT_SPFX_CONTEXT__`.
 *
 * - `aadHttpClient`    : used by the `@sinequa/atomic` web-api (spfx build) — initialized
 *                        once via `initializeAadHttpClient()` at startup (see main.spfx.ts).
 * - `aadTokenProvider` : used by the Angular interceptor `aadAuthInterceptorFn` to carry the
 *                        Azure AD bearer on direct `HttpClient` calls (query, aggregations,
 *                        preview, export, text-chunk, plugin, principal, app…).
 * - `resourceUri`      : AAD App ID / resource URI of the Sinequa API.
 * - `backendUrl`       : Sinequa server URL. REQUIRED in prod: in SharePoint,
 *                        `window.location.origin` is the SP site (not Sinequa) and there is no
 *                        dev proxy — without it the `api/v1/*` calls would go to SharePoint.
 * - `app`              : Sinequa application name (otherwise taken from the environment).
 */
export interface MintSpfxContext {
  aadHttpClient: AadHttpClient;
  aadTokenProvider: AadTokenProvider;
  resourceUri: string;
  backendUrl?: string;
  app?: string;
}

/** DI token providing the `AadTokenProvider` from the host SPFx context. */
export const AAD_TOKEN_PROVIDER = new InjectionToken<AadTokenProvider>("AAD_TOKEN_PROVIDER");

/** DI token providing the AAD App ID / resource URI targeted by backend requests. */
export const AAD_RESOURCE_URI = new InjectionToken<string>("AAD_RESOURCE_URI");
