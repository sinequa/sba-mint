---
title: tryOAuthAuthentication
---

Initiates the OAuth authentication process and redirects the user to the provider's login page. Stores the redirect URL in localStorage.

#### Example

```js title="try-oauth-authentication.js"
import { tryOAuthAuthentication } from '@sinequa/atomic';

// Initiates the OAuth authentication process
await tryOAuthAuthentication();
```
