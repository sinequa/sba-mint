---
title: BodyInterceptorFn
---

## Overview
Interceptor function that modifies the request body by appending a "locale" parameter with the value "fr".
If the request body is of type FormData, the "locale" parameter is appended directly.  
If the request body is an object, a new object is created with the "locale" parameter added.

### Usage
```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(WithInterceptors([
      bodyInterceptorFn,
      ...
    ]))
  ]
}
```