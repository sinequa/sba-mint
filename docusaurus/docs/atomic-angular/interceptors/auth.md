---
title: AuthInterceptorFn
---

## Overview
Intercepts HTTP requests to add authentication headers and handle CSRF tokens.

This interceptor checks if the user is logged in and adds necessary headers
to the request, including a CSRF token. If user override is active, it sets
the override user and domain headers instead. It also updates the CSRF token
from the response headers if present.

### Usage
```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(WithInterceptors([
      authInterceptorFn,
      ...
    ]))
  ]
}
```