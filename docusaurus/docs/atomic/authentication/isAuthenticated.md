---
title: isAuthenticated
---


Checks if the user is authenticated by verifying the presence of a CSRF token.

:::warning
This is a basic check. If a CSRF token exists (even if expired), you are considered authenticated. If you try to make a query with an expired token, an automatic reconnection will be attempted.
:::

## Example

```js title="is-authenticated.js"
const authenticated = isAuthenticated();
// returns `true` or `false`
```
