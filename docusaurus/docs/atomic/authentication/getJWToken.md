---
title: getJWToken
sidebar_class_name: update
---

Sends credentials to the backend to obtain a JSON Web Token (JWT). If a valid CSRF token is returned in the response, it is automatically stored in session storage.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `credentials` | `Credentials` | ✓ | Username and password credentials |

**Returns** `Promise<string | null>` — the JWT token if authentication succeeded, or `null` otherwise.

**Example**

```typescript title="get-jwt-token.ts"
import { getJWToken } from '@sinequa/atomic';

const token = await getJWToken({ username: 'user', password: 'pa$$word' });
if (token) {
  console.log('JWT token:', token);
} else {
  console.log('Authentication failed');
}
```
