---
title: Session & token management
sidebar_class_name: new
---

Sinequa authentication relies on a **CSRF token** (in `sessionStorage`) plus a **session cookie**. This recipe explains how sessions extend themselves, how to react cleanly to expiry, and how to surface password expiration.

## Sessions are sliding (automatic refresh)

On **every response**, the library inspects the `sinequa-jwt-refresh` header and stores a new token if the server provides one. As long as the user keeps making requests, the session extends itself transparently — you usually have **nothing to do** to keep an active session alive.

## What happens on expiry (401)

When the token/cookie is no longer valid, the API call returns **401** and the library throws an `UnauthorizedError` — so the promise of `fetchQuery`, `fetchPreview`, etc. **rejects**. (Likewise `500` → `ServerError`, others → `ApiError`.) There is no magic redirect: **your app reacts** to the rejection.

## Pattern: silent retry, then reset

On 401, try to silently recover a session (e.g. a still-valid SSO cookie) via `getCsrfToken()`. If that fails, clear local state with `clearSessionTokens()` — which emits `'authenticated' = false`, so your auth context routes back to login.

```js title="with-reauth.js"
import { clearSessionTokens, getCsrfToken } from '@sinequa/atomic';

function isUnauthorized(err) {
  return (
    err?.name === 'UnauthorizedError' ||
    (err instanceof Error && /unauthor/i.test(err.message))
  );
}

// Wrap any data call. Retries ONCE, then resets to login on failure.
export async function withReauth(call) {
  try {
    return await call();
  } catch (err) {
    if (!isUnauthorized(err)) throw err;

    // 1) Try to re-validate an existing session (cookie/SSO). Does not redirect.
    //    Trust the RETURNED token, not isAuthenticated() (which only tests presence).
    let fresh = null;
    try {
      fresh = await getCsrfToken();
    } catch {
      /* no ambient session */
    }
    if (fresh) return await call(); // single retry

    // 2) Otherwise reset. clearSessionTokens() emits 'authenticated' = false
    //    → the protected layout redirects to /login.
    clearSessionTokens();
    throw err;
  }
}
```

Usage:

```js
import { fetchQuery } from '@sinequa/atomic';

const result = await withReauth(() => fetchQuery({ name, text, page }));
```

:::caution Bound the retry to a single attempt
Retrying in a loop risks an infinite cycle if the server keeps returning 401.
:::

## React: a `useReauthedCall` helper

Wrap your data calls so every protected fetch in a component benefits from the silent-retry behaviour.

```jsx title="use-reauthed-call.jsx"
import { useCallback } from 'react';
import { withReauth } from './with-reauth';

export function useReauthedCall() {
  // Stable wrapper you can reuse across the component.
  return useCallback((call) => withReauth(call), []);
}
```

```jsx title="usage.jsx"
import { fetchQuery } from '@sinequa/atomic';
import { useReauthedCall } from './use-reauthed-call';

function SearchButton({ name, text }) {
  const reauthed = useReauthedCall();

  async function onClick() {
    const result = await reauthed(() => fetchQuery({ name, text, page: 1 }));
    // … if the session was unrecoverable, the auth context already redirected to login
  }

  return <button onClick={onClick}>Search</button>;
}
```

## Password expiration

`@sinequa/atomic` exposes two date helpers that compare an **ISO date** to now:

```js
import { isExpired, expiresSoon } from '@sinequa/atomic';

isExpired(iso);          // true if the ISO date is in the past (or now)
expiresSoon(iso, 7);     // true if it falls within the next N days (default 7)
```

These are **not** about the session/token — use them for the user's **password** expiry, exposed on the `Principal` as `passwordExpirationDate`:

```jsx title="PasswordExpiryBanner.jsx"
import { isExpired, expiresSoon } from '@sinequa/atomic';

export function PasswordExpiryBanner({ principal }) {
  const date = principal?.passwordExpirationDate;
  if (!date) return null;

  if (isExpired(date)) {
    return <div role="alert" className="banner error">Your password has expired — please change it.</div>;
  }
  if (expiresSoon(date, 7)) {
    return <div role="status" className="banner warn">Your password expires soon. Consider changing it.</div>;
  }
  return null;
}
```

## Reading the CSRF token's own expiry

The token's deadline is encoded **inside the token**, after the `|` character (a Unix timestamp in seconds). The library stores the whole token and does not decode it — read it yourself only for display (a countdown, diagnostics):

```js title="token-expiry.js"
import { getToken } from '@sinequa/atomic';

export function tokenExpiry(token = getToken()) {
  const unixSeconds = Number(token?.split('|')[1]);
  return Number.isFinite(unixSeconds) ? new Date(unixSeconds * 1000) : null;
}
```

:::tip In practice, you don't need to test this yourself
The sliding session keeps the token fresh while the user is active, and the 401 failure path covers the case where it's genuinely stale. Decoding the deadline is only useful for display.
:::

## See also

- [Authentication](./authentication.md) — the `AuthProvider` that listens for `'authenticated'` and gates routes.
- [Web API Helpers](../features/web-api-helpers.md) — `UnauthorizedError`, `ServerError`, `ApiError`.
