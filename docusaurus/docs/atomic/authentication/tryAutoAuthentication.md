---
title: tryAutoAuthentication
sidebar_class_name: new
---

Probes the server for **auto-authentication** (e.g. **OIDC** with an existing IdP session) before the
`unknown` mode falls back to the credentials form. See [Authentication flows](./auth-flows.md) →
*OIDC / server-side auto-authentication*.

Unlike [`getCsrfToken`](./getCsrfToken.md) (which uses `suppressErrors=true` and never runs the auth
challenge) and unlike `fetchPrincipal` (which sends `noAutoAuthentication=true` to disable it), this
probe issues a `GET api/v1/principal?action=get` **allowing the server to auto-authenticate**:

- no `noAutoAuthentication`, no `suppressErrors` — the server runs its auth challenge;
- `redirect: "manual"` — an auth redirect to the IdP surfaces as a non-200 instead of a CORS network
  error;
- a 10s timeout (`AUTH_TIMEOUT_MS`).

A successful `200` also carries the `sinequa-jwt-refresh` header, which `handleResponse` feeds into
`setToken`, so the session is immediately usable.

**Returns** `Promise<boolean>` — `true` when the server auto-authenticated the user (`200`), `false`
otherwise (401, redirect, timeout or any network error). **Never throws.**

**Example**

```typescript title="try-auto-authentication.ts"
import { tryAutoAuthentication } from '@sinequa/atomic';

// Inside the `unknown` branch of login(), before falling back to credentials:
if (await tryAutoAuthentication()) {
  // The server established a session (OIDC); capture the CSRF token and proceed as `sso`.
}
```
