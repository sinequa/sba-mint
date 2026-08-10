---
title: logout
sidebar_class_name: update
---

Logs out the current user by clearing session tokens and, unless user override mode is active, deleting the web token cookie via the server.

**Returns** `Promise<string | undefined>` — the logout URL returned by the server, or `undefined` if user override mode is active or the deletion failed.

**Example**

```typescript title="logout.ts"
import { logout } from '@sinequa/atomic';

document.addEventListener('authenticated', (event: Event) => {
  const { authenticated } = (event as CustomEvent).detail;
  if (!authenticated) {
    // Redirect to login page
    window.location.href = '/login';
  }
});

const redirectUrl = await logout();
if (redirectUrl) {
  window.location.href = redirectUrl;
}
```

---

## clearSessionTokens

Clears all local authentication tokens and emits an `'authenticated'` event with `false`. This function is called internally by `logout()` but can also be used independently to reset the authentication state without making a server request.

### Returns `void`

### What it does

- Removes the CSRF token from `localStorage`
- Removes the Sinequa credentials from `sessionStorage`
- Emits an `'authenticated'` event with `false`

**Example**

```typescript title="clearSessionTokens.ts"
import { clearSessionTokens } from '@sinequa/atomic';

// Reset local auth state without hitting the server (e.g. after a forced session expiry)
clearSessionTokens();
```
