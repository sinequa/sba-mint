---
title: Authentication
---

This module provides functions to manage authentication processes.


## Authentication
### login()

Logs in the user with the provided credentials when provided.  
Whether the authentication is successful or not, the [`authenticated$`](#authenticated) observable is emitted with the value `true` or `false`.

| parameter | type | description |
| --- | --- | --- |
| credentials | `Credentials` | Optional. |

```js title="Credentials Type"
type Credentials = {
  username: string;
  password: string;
}
```

:::info
when no credentials are provided (default), if no valid token exists, the user will be redirected to be authenticated using the provider defined in the Sinequa Admin.
:::
#### Example

```js title="login.js"
login().then(console.log);
// will display true if authentication successed, otherwise false
```

```js title="login-credentials.js"
login({ username: 'user', password: 'pa$$word' }).then(console.log);
// will display true if authentication successed, otherwise false
```

```js title="login-rxjs.js"
authenticated$.subscribe(value => console.log("authenticated", value));
// once the observable emits, the console log will display the `value`

login({ username: 'user', password: 'pa$$word' }).then(console.log);
// will display true if authentication successed, otherwise false
```

### logout()

Logs out the user and clean token and cookies.  
The token is removed from the local storage and cookies deleted with the [deleteWebTokenCookie()](#deletewebtokencookie) function.  
The observable [`authenticated$`](#authenticated) will emits `false`.

#### Example

```js title="logout.js"
logout();
```

### isAuthenticated()

Checks if the user is authenticated.

:::warning
This is a basic check. If a CSRF token exists (whether it's expired or not), you are considered authenticated.  
Luckylly, when you try to make a query and the token was expired, an automatic reconnection will be made.
:::

#### Example

```js title="is-authenticated.js"
const authenticated = isAuthenticated();
// will returns `true` or `false`
```


### authenticated$

An RxJS Subject that emits a boolean value indicating whether the user is authenticated.

## Tokens

### getJWTToken()

Retrieves a JSON Web Token (JWT) by sending a POST request to the backend server.

| parameter | type |
| --- | --- |
| credentials | `Credentials` |

```js title="Credentials Type"
type Credentials = {
  username: string;
  password: string;
}
```
#### Example

```ts title="get-jwt-token.js"
const response = await getJWTToken({ user: 'user', password: 'pa$$word' });
if(response) {
  const token = getToken();
  console.log("Token", token);
}
// `response` will contains `true` or `false`
```

### deleteWebTokenCookie()

Deletes the JSON Web Token (JWT) cookie by sending a GET request to the backend server.

#### Example

```js title="delete-web-token-cookie.js"
const response = await deleteWebTokenCookie();
```

### getToken()

Retrieves the CSRF token from the local storage.

#### Example

```ts title="get-token.js"
const token = getToken();
```

### setToken()

Save the CSRF token into the local storage.

```ts title="get-token.js"
setToken("new token value");
```
