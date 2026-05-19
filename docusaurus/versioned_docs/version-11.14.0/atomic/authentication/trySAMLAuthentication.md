---
title: trySAMLAuthentication
---

Initiates the SAML authentication flow by redirecting the user to the configured identity provider's login page. The current URL is saved to `localStorage` so the application can redirect back after authentication.

:::info
The SAML provider name is read from `globalConfig.autoSAMLProvider`. Ensure `appInitializerFn()` has been called before using this function.
:::

**Returns** `Promise<void>`

**Example**

```typescript title="try-saml-authentication.ts"
import { trySAMLAuthentication } from '@sinequa/atomic';

// Redirect to the SAML identity provider
await trySAMLAuthentication();
```
