---
title: ToastInterceptorFn
---

Intercepts HTTP requests and handles errors by displaying toast notifications.

This interceptor checks if the request URL includes __api/v1/audit.notify__. If it does,
the request is passed through without any modifications. For other requests, it catches
errors and displays a toast notification for specific HTTP status codes (400, 403, 500, 503).

:::tip
This interceptor is useful for providing user feedback on HTTP errors, especially in applications
where users need to be informed about issues without interrupting their workflow.

It uses the notification system provided by the[@sinequa/atomic](/atomic/features/notification) library to display toast notifications.
:::

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
