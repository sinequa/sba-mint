import { HttpInterceptorFn } from "@angular/common/http";
import { auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn, toastInterceptorFn } from "@sinequa/atomic-angular";
import { aadAuthInterceptorFn } from "./aad-auth.interceptor";

/**
 * Chaîne d'interceptors HTTP du build `spfx`.
 *
 * Identique à `http-interceptors.ts`, avec `aadAuthInterceptorFn` intercalé APRÈS
 * `authInterceptorFn` : l'auth de la lib pose CSRF + cookies, puis l'AAD ajoute le bearer
 * Azure AD sur les appels backend directs.
 */
export const appInterceptors: HttpInterceptorFn[] = [
  bodyInterceptorFn,
  authInterceptorFn,
  aadAuthInterceptorFn,
  auditInterceptorFn,
  errorInterceptorFn,
  toastInterceptorFn
];
