import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { globalConfig } from "@sinequa/atomic";
import { from, switchMap } from "rxjs";
import { AAD_RESOURCE_URI, AAD_TOKEN_PROVIDER } from "./spfx-context";

/**
 * Interceptor Azure AD pour le canal `HttpClient` Angular (build `spfx` uniquement).
 *
 * Le web-api de `@sinequa/atomic` (build spfx) porte déjà l'auth AAD via `AadHttpClient`.
 * Mais les services qui appellent le backend Sinequa directement via le `HttpClient` Angular
 * (query, aggregations, preview, export, text-chunk, json-method-plugin, principal, app…)
 * contournent ce client : cet interceptor leur ajoute le bearer AAD.
 *
 * Ne cible que les requêtes vers `globalConfig.backendUrl`. À enregistrer APRÈS
 * `authInterceptorFn` (qui gère CSRF + cookies) — les deux coexistent (headers distincts).
 */
export const aadAuthInterceptorFn: HttpInterceptorFn = (req, next) => {
  const backendUrl = globalConfig.backendUrl ?? "";
  if (!backendUrl || !req.url.startsWith(backendUrl)) {
    return next(req);
  }

  const tokenProvider = inject(AAD_TOKEN_PROVIDER);
  const resourceUri = inject(AAD_RESOURCE_URI);

  return from(tokenProvider.getToken(resourceUri)).pipe(
    switchMap(token => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
  );
};
