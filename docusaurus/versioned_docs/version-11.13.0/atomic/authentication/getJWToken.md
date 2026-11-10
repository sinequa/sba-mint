---
title: getJWToken
---

Retrieves a JSON Web Token (JWT) by sending a POST request to the backend server with credentials.
If a valid CSRF token is returned, it is stored in session storage.

| parameter    | type          |
| ------------ | ------------- |
| `credentials`  | `Credentials` |

#### Example

```js title="get-jwt-token.js"
import { getJWToken } from '@sinequa/atomic';

const token = await getJWToken({ username: 'user', password: 'pa$$word' });
if(token) {
  console.log("Token", token);
}
```
