---
title: AuditInterceptorFn
---

## Overview
Intercepts HTTP requests to add audit information if the request URL includes the API path.

This interceptor checks if the request URL contains the specified API path from the global configuration.  
If the request body is JSON serializable and not an instance of `HttpParams`, it adds additional audit information
to the request body using the `addAuditAdditionalInfo` function.

### Usage
```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(WithInterceptors([
      auditInterceptorFn,
      ...
    ]))
  ]
}
```