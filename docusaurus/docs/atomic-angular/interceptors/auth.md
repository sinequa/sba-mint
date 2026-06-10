---
title: AuthInterceptorFn
sidebar_class_name: update
---

Intercepts HTTP requests to add authentication headers and handle CSRF tokens. When the user is logged in, the interceptor injects the CSRF token; when user override is active it sets override-user and override-domain headers. It also refreshes the CSRF token from response headers when present.

## Usage

```typescript title="app.config.ts"
import { authInterceptorFn } from '@sinequa/atomic-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      authInterceptorFn,
    ])),
  ],
};
```
