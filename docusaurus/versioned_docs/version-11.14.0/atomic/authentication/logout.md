---
title: logout
sidebar_class_name: update
---

Logs out the current user. Removes the CSRF token from session storage, deletes the web token cookie, and emits an `'authenticated'` event with `false`.

**Returns** `Promise<void>`

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

await logout();
console.log('User logged out.');
```
