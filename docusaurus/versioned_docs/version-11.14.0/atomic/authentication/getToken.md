---
title: getToken
---

Retrieves the CSRF token from session storage.

**Returns** `string | null` — the CSRF token, or `null` if not present.

**Example**

```typescript title="get-token.ts"
import { getToken } from '@sinequa/atomic';

const token = getToken();
if (token) {
  console.log('CSRF token:', token);
}
```
