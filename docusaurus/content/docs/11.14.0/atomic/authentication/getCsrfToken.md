---
title: getCsrfToken
sidebar_class_name: update
---

Requests a CSRF token from the backend server and stores it in session storage.

The endpoint is called with `suppressErrors=true`, so the server answers `200` **without a token** when
there is no session (instead of an error, and without running the auth challenge). A missing token is
therefore an expected "not authenticated / no CSRF token needed" signal — e.g. a proxy SSO that
authenticates via cookie.

**Returns** `Promise<string | null>` — the CSRF token when present, or `null` when the server returns a
`200` with no token (the expected "no session" signal).

**Throws** on a genuine network / timeout / HTTP failure (logged at `warn` then rethrown) — an
exceptional condition, distinct from the tokenless `200`. Wrap the call in a `try/catch` when a probe
failure should not propagate.

**Example**

```typescript title="get-csrf-token.ts"
import { getCsrfToken } from '@sinequa/atomic';

const token = await getCsrfToken();
if (token) {
  console.log('CSRF token obtained:', token);
} else {
  console.log('No CSRF token available (user may need to log in)');
}
```
