---
title: getCsrfToken
sidebar_class_name: update
---

Requests a CSRF token from the backend server and stores it in session storage.

**Returns** `Promise<string | null>` — the CSRF token if obtained, or `null` if the request failed.

**Example**

```typescript title="get-csrf-token.ts"
import { getCsrfToken } from '@sinequa/atomic';

const token = await getCsrfToken();
if (token) {
  console.log('CSRF token obtained:', token);
} else {
  console.log('No CSRF token available (user may need to log in)');
}
```
