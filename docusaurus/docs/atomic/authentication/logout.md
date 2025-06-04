---
title: logout
---

Logs out the user, removes tokens from storage, and deletes cookies via `deleteWebTokenCookie`. Emits the `'authenticated'` event with `false`.

## Example

```js title="logout.js"
logout();
```
