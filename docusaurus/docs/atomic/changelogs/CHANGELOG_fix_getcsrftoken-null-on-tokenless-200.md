# Changelog — fix: `getCsrfToken` returns `null` on a tokenless 200 (instead of throwing)

> Branch: `feat/oidc-auto-authentication`

## Overview

`getCsrfToken()` calls `api/v1/challenge?action=getCsrfToken&suppressErrors=true`. With
`suppressErrors=true` the server returns **HTTP 200 with no token** when there is no session — the
**expected** "not authenticated / no CSRF token needed" signal (e.g. a proxy SSO that authenticates via
cookie), not a failure. Previously the function threw `Error("No CSRF token returned")` in that case and
logged it via `error()` (an unconditional `console.error`), producing a spurious console error on every
bootstrap in cookie-only setups even though the HTTP call succeeded and the login flow worked.

A tokenless 200 is now reported by returning `null`. **Genuine transport failures still throw** — a
network / timeout / HTTP error is an exceptional condition the caller may need to react to, kept
distinct from the expected "no token" result.

## Changed (soft breaking)

- `getCsrfToken(): Promise<string | null>`:
  - token present → store it (`setToken`) and return it;
  - `200` with no token → **return `null`** (no log — expected "no session" signal);
  - genuine network / timeout / HTTP error → log at `warn` and **rethrow**.
- **Public API behaviour change**: the return type widens from `Promise<string>` to
  `Promise<string | null>`, and the tokenless case no longer throws. Genuine-error behaviour is
  unchanged (still throws). Existing truthiness checks (`if (await getCsrfToken())`) keep working; the
  `error`-level log on the tokenless path is gone (real failures now log at `warn`).
- `login.ts` — unchanged in behaviour: the SSO probe keeps its `try/catch` and the post-OIDC
  best-effort refresh keeps its `.catch(() => {})`, which now also absorb the (rarer) genuine-error
  throw so a transient probe failure never aborts the bootstrap.

## Tests

- `get-csrf-token.test.ts` — the four tokenless cases assert a `null` return with **no log**; the
  network / server-error and timeout cases assert a `warn` **and a rethrow**.
- `login.test.ts` — "no session" mocks use `mockResolvedValue(null)`; a new case asserts that a thrown
  probe error is tolerated (caught, falls through to credentials) rather than aborting the bootstrap.
  The two redundant "CSRF retrieval fails with 401 / generically" cases were removed. 156 auth tests
  pass.

## Notes

- Console noise removed: the benign tokenless 200 no longer logs an `error`. Real request failures stay
  visible (now `warn`) and still propagate.
