---
title: App
sidebar_position: 1
---

## Overview
This module provides functionality for initializing and retrieving application-related information. It allows users to:

- Set up global configurations for the application
- Fetch pre-login data from the server
- Retrieve the current application object and its settings
- Access authentication-related information

These operations enable efficient application setup, configuration management, and access to crucial app-related data, enhancing the overall functionality and user experience of the application.


### appInitializerFn()
Initializes the application by setting the global configuration and fetching app pre-login data.

__Returns__ A promise that resolves to the application's initialization function.

:::tip
Call this function once in your application to automatically [configure the app](../configurations#globalconfig) with the pre-login data coming from the server.
:::

#### Example
```js title="example-app-initializer.js"
import { appInitializerFn, globalConfig } from "@sinequa/atomic";

appInitializerFn().then( response => console.log(response));

// by default, globalConfig contains only:
//
// {
//   apiPath: "api/v1",
//   loginPath: "/login",
//   backendUrl: window.location.origin
// }

const config = globalConfig();
console.log("config", config);
// Output: a AppGlobalConfig object with the pre-login data (as the authentication providers) included.
```

### fetchApp()
Fetches the current CCApp object.

__Returns__ A promise that resolves to the `CCApp` object.

#### Example
```ts title="example-fetch-app.js"
const app = await fetchApp();
console.log("app", app);
// Output: a CCApp object
```

### fetchAppPreLogin()
Fetches the pre-login information for the current app.

__Returns__ A promise that resolves to the pre-login `CCAppPreLogin` information of the app.

```js title="CCAppPreLogin Type"
export type CCAppPreLogin = {
  apiPath: string;
  autoOAuthProvider: string;
  autoSAMLProvider: string;
  mode: string,
  version: string,
  versionDate: string,
}
```


#### Example
```js title="example-fetch-pre-login.js"
import { fetchPreLogin } from "@sinequa/atomic";

const appPreLogin = await fetchPreLogin();
console.log("appPreLogin", appPreLogin);
// Output: a CCAppPreLogin object
```
