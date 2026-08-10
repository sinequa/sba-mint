# Changelog — feat: OIDC server-side auto-authentication (unknown login branch)

> Branch: `feat/oidc-auto-authentication`

## Overview

When no authentication provider is declared (`authMode` resolves to `unknown`) and there is no local
session, the server may still auto-authenticate the user — typically an OIDC reverse proxy that has a
valid IdP session and injects the identity (e.g. `OIDC_CLAIM_upn`). Previously `login()` fell straight
through to the credentials form in this case. It now probes for server-side auto-authentication first.

---

## Added

- `tryAutoAuthentication()` (`src/authentication/session/try-auto-authentication.ts`) — probes a
  protected endpoint (`api/v1/principal?action=get`) **without** `noAutoAuthentication` and **without**
  `suppressErrors`, in `redirect: "manual"`, so the server is allowed to run its auto-auth challenge.
  Returns `true` on `200` (auto-authenticated), `false` on 401 / redirect / timeout / network error.
  Never throws. Distinct from `getCsrfToken` (suppresses the challenge) and `fetchPrincipal` (disables
  auto-auth via `noAutoAuthentication=true`).

## Changed

- `login()` — the `unknown` branch now calls `tryAutoAuthentication()` before falling back to the
  credentials form. **A `200` is authoritative on its own**: the session is established (typically via
  an HttpOnly cookie), so the user is authenticated (`authMode = sso`) even when no token is available
  client-side. The subsequent `getCsrfToken()` is a **best-effort** refresh (`.catch(() => {})`): it
  primes `getToken()` where the challenge endpoint is available, but its failure no longer blocks an
  already-established session — the prior `try/catch` gate fell back to credentials whenever the token
  could not be confirmed, which broke proxy SSO setups that return no token via header or challenge.

## Tests

- `login.test.ts` — auto-auth probe success authenticates as `sso`; **stays authenticated when the
  CSRF refresh fails** (proxy SSO / cookie-only); server-not-auto-authenticating still falls back to
  credentials. 17 passed.

## Notes

- The companion `atomic-angular` change (`withCredentials` on the HttpClient path + SSO re-probe
  before reload) ensures the cookie established here is sent on every subsequent request and that a
  later 401 does not loop on reload. See `atomic-angular` branch `fix/logout-signed-out-view`.
