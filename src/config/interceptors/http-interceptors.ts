import { HttpInterceptorFn } from "@angular/common/http";
import { auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn, toastInterceptorFn } from "@sinequa/atomic-angular";

/**
 * Chaîne d'interceptors HTTP de l'application (build standard / core).
 *
 * Le build `spfx` remplace ce fichier par `http-interceptors.spfx.ts` (fileReplacements dans
 * angular.json) pour intercaler l'interceptor Azure AD. Garder les deux listes synchronisées.
 */
export const appInterceptors: HttpInterceptorFn[] = [
  bodyInterceptorFn,
  authInterceptorFn,
  auditInterceptorFn,
  errorInterceptorFn,
  toastInterceptorFn
];
