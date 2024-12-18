---
title: ErrorInterceptorFn
---

## Overview
Interceptor function that handles 401 and 403 HTTP errors by logging out the user and redirecting to the login page.  

:::note
By default the login route defined in the global configuration is `/login`
:::

### Usage
```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(WithInterceptors([
      errorInterceptorFn,
      ...
    ]))
  ]
}
```