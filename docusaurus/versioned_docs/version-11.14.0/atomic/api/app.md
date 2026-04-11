---
title: App
sidebar_class_name: update
sidebar_position: 1
---

This module provides functions to initialize the application and retrieve application configuration data from the Sinequa backend. It handles:

- Automatic global configuration setup from pre-login server data
- Fetching the full application configuration object (`CCApp`)
- Fetching pre-login configuration data

## Functions

### `appInitializerFn()`

Initializes the application by detecting the backend URL and app name from the current URL, then fetching the pre-login configuration from the server. The results are automatically merged into [`globalConfig`](../features/configurations#globalconfig).

:::tip
Call this function once during application startup (e.g., before rendering your app) to automatically configure authentication providers from server data.
:::

:::info
If `globalConfig.useCredentials` is already set to `true`, this function skips the pre-login fetch and configures the app for credentials-based authentication only.
:::

**Returns** `Promise<CCAppPreLogin>` — the pre-login configuration returned by the server.

**Example**

```typescript title="app-initializer.ts"
import { appInitializerFn, globalConfig } from '@sinequa/atomic';

await appInitializerFn();

// globalConfig is now populated with backendUrl, app name,
// and authentication provider settings from the server.
console.log(globalConfig.app);
console.log(globalConfig.autoOAuthProvider);
```

---

### `fetchApp()`

Fetches the full `CCApp` configuration object for the current application.

**Returns** `Promise<CCApp>` — the application configuration.

**Example**

```typescript title="fetch-app.ts"
import { fetchApp } from '@sinequa/atomic';

const app = await fetchApp();
console.log(app);
```

---

### `fetchAppPreLogin()`

Fetches the pre-login configuration for the current application. This is a lighter call that returns only the data available before the user authenticates.

**Returns** `Promise<CCAppPreLogin>` — the pre-login configuration.

```typescript title="CCAppPreLogin type"
type CCAppPreLogin = {
  apiPath: string;
  autoOAuthProvider: string;
  autoSAMLProvider: string;
  mode: string;
  version: string;
  versionDate: string;
};
```

**Example**

```typescript title="fetch-app-pre-login.ts"
import { fetchAppPreLogin } from '@sinequa/atomic';

const preLogin = await fetchAppPreLogin();
console.log(preLogin.autoOAuthProvider);
console.log(preLogin.version);
```
