---
title: tryOAuthAuthentication
---

Initiates the OAuth authentication flow by redirecting the user to the configured OAuth provider's login page. The current URL is saved to `localStorage` so the application can redirect back after authentication.

:::info
The OAuth provider name is read from `globalConfig.autoOAuthProvider`. Ensure `appInitializerFn()` has been called before using this function.
:::

**Returns** `Promise<void>`

**Example**

```typescript title="try-oauth-authentication.ts"
import { tryOAuthAuthentication } from '@sinequa/atomic';

// Redirect to the OAuth provider
await tryOAuthAuthentication();
```
