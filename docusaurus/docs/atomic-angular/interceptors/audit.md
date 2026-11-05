---
title: AuditInterceptorFn
sidebar_class_name: update
---

Intercepts HTTP requests to add audit information when the request URL includes the configured API path. If the request body is JSON-serializable and not an `HttpParams` instance, additional audit metadata is injected via `addAuditAdditionalInfo`.

## Usage

```typescript title="app.config.ts"
import { auditInterceptorFn } from '@sinequa/atomic-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      auditInterceptorFn,
    ])),
  ],
};
```
