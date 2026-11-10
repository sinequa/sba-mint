---
title: getCsrfToken
---

Retrieves the CSRF token from the backend server and stores it in session storage. Returns the token if successful, or `null` if not.

#### Example

```js title="get-csrf-token.js"
import { getCsrfToken } from '@sinequa/atomic';

// Retrieves the CSRF token
const token = await getCsrfToken();
```
