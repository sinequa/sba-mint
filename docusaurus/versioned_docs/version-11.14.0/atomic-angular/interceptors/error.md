---
title: ErrorInterceptorFn
---

Intercepts HTTP responses and handles `401` and `403` errors by logging out the user and redirecting to the login page.

:::note
The login route defaults to `/login` as defined in the global configuration.
:::

## Usage

```typescript title="app.config.ts"
import { errorInterceptorFn } from '@sinequa/atomic-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      errorInterceptorFn,
    ])),
  ],
};
```
