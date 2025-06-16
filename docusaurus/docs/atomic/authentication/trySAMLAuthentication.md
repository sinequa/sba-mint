---
title: trySAMLAuthentication
---

Initiates the SAML authentication process and redirects the user to the identity provider's login page.
Stores the redirect URL in localStorage.

#### Example

```js title="try-saml-authentication.js"
import { trySAMLAuthentication } from '@sinequa/atomic';

// Initiates the SAML authentication process
await trySAMLAuthentication();
```
