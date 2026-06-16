import { InjectionToken } from "@angular/core";
import type { AadHttpClient, AadTokenProvider } from "@microsoft/sp-http";

/**
 * Contrat que le web part hôte SPFx doit fournir AVANT de charger le bundle mint
 * (build `spfx`), via `window.__MINT_SPFX_CONTEXT__`.
 *
 * - `aadHttpClient`    : utilisé par le web-api de `@sinequa/atomic` (build spfx) — initialisé
 *                        une fois via `initializeAadHttpClient()` au démarrage (cf. main.spfx.ts).
 * - `aadTokenProvider` : utilisé par l'interceptor Angular `aadAuthInterceptorFn` pour porter le
 *                        bearer Azure AD sur les appels `HttpClient` directs (query, aggregations,
 *                        preview, export, text-chunk, plugin, principal, app…).
 * - `resourceUri`      : AAD App ID / resource URI de l'API Sinequa.
 * - `backendUrl`       : URL du serveur Sinequa. OBLIGATOIRE en prod : dans SharePoint,
 *                        `window.location.origin` est le site SP (pas Sinequa) et il n'y a pas de
 *                        proxy de dev — sans ça les `api/v1/*` partiraient vers SharePoint.
 * - `app`              : nom de l'application Sinequa (sinon repris de l'environnement).
 */
export interface MintSpfxContext {
  aadHttpClient: AadHttpClient;
  aadTokenProvider: AadTokenProvider;
  resourceUri: string;
  backendUrl?: string;
  app?: string;
}

/** Token DI fournissant le `AadTokenProvider` issu du contexte SPFx hôte. */
export const AAD_TOKEN_PROVIDER = new InjectionToken<AadTokenProvider>("AAD_TOKEN_PROVIDER");

/** Token DI fournissant l'AAD App ID / resource URI ciblé par les requêtes backend. */
export const AAD_RESOURCE_URI = new InjectionToken<string>("AAD_RESOURCE_URI");
