import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { globalConfig } from "@sinequa/atomic";
import { from, switchMap } from "rxjs";
import { AAD_RESOURCE_URI, AAD_TOKEN_PROVIDER } from "./spfx-context";

/**
 * Azure AD interceptor for the Angular `HttpClient` channel (`spfx` build only).
 *
 * The `@sinequa/atomic` web-api (spfx build) already carries the AAD auth via `AadHttpClient`.
 * But the services that call the Sinequa backend directly via the Angular `HttpClient`
 * (query, aggregations, preview, export, text-chunk, json-method-plugin, principal, app…)
 * bypass that client: this interceptor adds the AAD bearer for them.
 *
 * Targets only requests to `globalConfig.backendUrl`. Register it AFTER
 * `authInterceptorFn` (which handles CSRF + cookies) — both coexist (distinct headers).
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
