---
title: logout
---

Logs out the user, removes tokens from storage, and deletes cookies via `deleteWebTokenCookie`.
Emits the `'authenticated'` event with `false`.

#### Example

```js title="logout.js"
import { logout } from '@sinequa/atomic';

addEventListener('authenticated', (event) => {
  console.log('Authenticated:', event.detail.authenticated);
});

logout().then(() => {
  console.log('User logged out successfully');
});
```
