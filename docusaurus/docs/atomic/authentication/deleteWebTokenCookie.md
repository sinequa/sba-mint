---
title: deleteWebTokenCookie
sidebar_class_name: update
---

Deletes the JSON Web Token (JWT) cookie by sending a GET request to the backend server's cookie-deletion endpoint. This is typically called during logout.

**Returns** `Promise<{ methodresult: string; logoutUrl?: string }>` — an object containing:

- `methodresult`: `"ok"` if the cookie was successfully deleted, an error string otherwise.
- `logoutUrl` _(optional)_: a redirect URL provided by the server after logout, when configured.

## Example

```typescript title="delete-web-token-cookie.ts"
import { deleteWebTokenCookie } from '@sinequa/atomic';

const { methodresult, logoutUrl } = await deleteWebTokenCookie();

if (methodresult === 'ok' && logoutUrl) {
  window.location.href = logoutUrl;
}
```
