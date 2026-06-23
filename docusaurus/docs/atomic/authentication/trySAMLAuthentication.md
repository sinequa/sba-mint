---
title: trySAMLAuthentication
sidebar_class_name: update
---

Initiates the SAML authentication flow by redirecting the user to the configured identity provider's login page. The current URL is saved to `localStorage` so the application can redirect back after authentication.

:::info
The SAML provider name is read from `globalConfig.autoSAMLProvider`. Ensure `initializeAppConfig()` has been called before using this function.
:::

:::caution Redirect loop guard
A one-shot `sessionStorage` flag (`AUTH_REDIRECT_ATTEMPT_KEY`) is set right before the redirect. If the user returns from the identity provider **still without a session** (e.g. the IdP's callback is not authorized for this application), the next call **throws** instead of redirecting again — the error message includes the provider name (`SAML sign-in with provider "…" did not establish a session …`). The flag is cleared by `login()` as soon as a session is established. This prevents an infinite redirect loop. See [Authentication flows](./auth-flows.md#provider-redirect-loop-guard-oauth--saml).
:::

**Returns** `Promise<void>`

**Example**

```typescript title="try-saml-authentication.ts"
import { trySAMLAuthentication } from '@sinequa/atomic';

// Redirect to the SAML identity provider
await trySAMLAuthentication();
```
