---
title: Configurations
---

## Overview

This module provides functionality for managing global configuration settings essential for connecting to the Sinequa platform. It includes:

- A global configuration object with default values for API paths and backend URLs
- A function to set and customize the global configuration
- Various configuration options to control authentication methods, user overrides, and API interactions

These tools allow developers to centralize and easily adjust application-wide settings, ensuring consistent configuration across the application for seamless integration with Sinequa services.


### globalConfig
This object contains the global configuration to enable connection to the Sinequa platform.  

:::info
By default the `globalConfig` object contains the following values:

```json
{ 
  apiPath: "api/v1", 
  loginPath: "/login", 
  backendUrl: window.location.origin 
}
```
:::

```js title="AppGlobalConfig Type"
export type AppGlobalConfig = {
  app?: string;
  backendUrl?: string;
  apiPath?: string;
  autoOAuthProvider?: string;
  autoSAMLProvider?: string;
  loginPath?: string;
  userOverride?: {
    username: string;
    domain: string;
  };
  userOverrideActive?: boolean;
  useCredentials?: boolean;           // when true, the credentials are sent with the request
};
```
#### Example

```js title="example-config.ts"
import { globalConfig } from "@sinequa/atomic";

console.log("configuration", globalConfig);
// Output: { apiPath: "api/v1", loginPath: "/login", backendUrl: <your-current-url> }
```


### setGlobalConfig()

Sets the global configuration for the application.  
Use this fonction when you need to customize the global configuration within your application.

| parameter | type | description |
| --- | --- | --- |
| config | `AppGlobalConfig` | The partial configuration object to be merged with the existing global configuration. |

```js title="AppGlobalConfig Type"
export type AppGlobalConfig = {
  app?: string;
  backendUrl?: string;
  apiPath?: string;
  autoOAuthProvider?: string;
  autoSAMLProvider?: string;
  loginPath?: string;
  userOverride?: {
    username: string;
    domain: string;
  };
  userOverrideActive?: boolean;
  useCredentials?: boolean;           // when true, the credentials are sent with the request
};
```
#### Example

```js title="example-get-global-config.ts"
import { globalConfig, setGlobalConfig } from "@sinequa/atomic";

// update the configuration with the `app` property
setGlobalConfig({ app: "training" })

const conf = globalConfig;
// will display: { app: "training", apiPath: "api/v1", loginPath: "/login", backendUrl: <your-current-url> }
```
