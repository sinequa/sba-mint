---
title: ToastInterceptorFn
sidebar_class_name: update
---

Intercepts HTTP responses and displays toast notifications for specific error status codes (`400`, `403`, `500`, `503`). Requests to `api/v1/audit.notify` are passed through without modification.

:::tip
This interceptor is useful for providing user feedback on HTTP errors without interrupting the user's workflow. It relies on the notification system from `@sinequa/atomic`.
:::

## Usage

```typescript title="app.config.ts"
import { toastInterceptorFn } from '@sinequa/atomic-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      toastInterceptorFn,
    ])),
  ],
};
```
