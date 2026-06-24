---
title: tryOAuthAuthentication
sidebar_class_name: update
---

Initiates the OAuth authentication flow by redirecting the user to the configured OAuth provider's login page. The current URL is saved to `localStorage` so the application can redirect back after authentication.

:::info
The OAuth provider name is read from `globalConfig.autoOAuthProvider`. Ensure `initializeAppConfig()` has been called before using this function.
:::

:::caution Redirect loop guard
A one-shot `sessionStorage` flag (`AUTH_REDIRECT_ATTEMPT_KEY`) is set right before the redirect. If the user returns from the provider **still without a session** (e.g. the provider's callback is not authorized for this application), the next call **throws** instead of redirecting again — the error message includes the provider name (`OAuth sign-in with provider "…" did not establish a session …`). The flag is cleared by `login()` as soon as a session is established. This prevents an infinite redirect loop. See [Authentication flows](./auth-flows.md#provider-redirect-loop-guard-oauth--saml).
:::

**Returns** `Promise<void>`

**Example**

```typescript title="try-oauth-authentication.ts"
import { tryOAuthAuthentication } from '@sinequa/atomic';

// Redirect to the OAuth provider
await tryOAuthAuthentication();
```
