---
title: BodyInterceptorFn
sidebar_class_name: update
---

Intercepts HTTP requests to append a `locale` parameter to the request body. If the body is `FormData`, the parameter is appended directly; if it is a plain object, a new object is created with the `locale` field added.

## Usage

```typescript title="app.config.ts"
import { bodyInterceptorFn } from '@sinequa/atomic-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      bodyInterceptorFn,
    ])),
  ],
};
```
