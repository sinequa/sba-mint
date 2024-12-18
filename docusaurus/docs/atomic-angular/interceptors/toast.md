---
title: ToastInterceptorFn
---

## Overview
Intercepts HTTP requests and handles errors by displaying toast notifications.

This interceptor checks if the request URL includes __api/v1/audit.notify__. If it does,
the request is passed through without any modifications. For other requests, it catches
errors and displays a toast notification for specific HTTP status codes (400, 403, 500, 503).


### Usage
```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(WithInterceptors([
      toastInterceptorFn,
      ...
    ]))
  ]
}
```