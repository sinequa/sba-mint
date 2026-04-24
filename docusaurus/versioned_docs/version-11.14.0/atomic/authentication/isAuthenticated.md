---
title: isAuthenticated
---

Checks whether the current user is authenticated by verifying the presence of a CSRF token in session storage.

:::warning
This is a presence-only check. An expired token will still cause this function to return `true`. If you make an API call with an expired token, an automatic re-authentication attempt will be made.
:::

**Returns** `boolean` — `true` if a CSRF token exists in session storage, `false` otherwise.

**Example**

```typescript title="is-authenticated.ts"
import { isAuthenticated } from '@sinequa/atomic';

if (isAuthenticated()) {
  console.log('User is authenticated');
} else {
  console.log('User is not authenticated');
}
```
