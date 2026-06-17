import { HttpInterceptorFn } from "@angular/common/http";
import { auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn, toastInterceptorFn } from "@sinequa/atomic-angular";
import { aadAuthInterceptorFn } from "./aad-auth.interceptor";

/**
 * HTTP interceptor chain for the `spfx` build.
 *
 * Identical to `http-interceptors.ts`, with `aadAuthInterceptorFn` inserted AFTER
 * `authInterceptorFn`: the lib auth sets CSRF + cookies, then AAD adds the Azure AD
 * bearer on direct backend calls.
 */
export const appInterceptors: HttpInterceptorFn[] = [
  bodyInterceptorFn,
  authInterceptorFn,
  aadAuthInterceptorFn,
  auditInterceptorFn,
  errorInterceptorFn,
  toastInterceptorFn
];
