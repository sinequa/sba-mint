---
title: deleteWebTokenCookie
sidebar_class_name: update
---

Deletes the JSON Web Token (JWT) cookie by sending a GET request to the backend server's cookie-deletion endpoint. This is typically called during logout.

**Returns** `Promise<void>`

**Example**

```typescript title="delete-web-token-cookie.ts"
import { deleteWebTokenCookie } from '@sinequa/atomic';

await deleteWebTokenCookie();
console.log('JWT cookie deleted');
```
