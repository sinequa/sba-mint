---
title: deleteWebTokenCookie
---

Deletes the JSON Web Token (JWT) cookie by sending a GET request to the backend server.

#### Example

```js title="delete-web-token-cookie.js"
import { deleteWebTokenCookie } from '@sinequa/atomic';

// Deletes the JWT cookie
const response = await deleteWebTokenCookie();
```
