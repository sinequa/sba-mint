---
title: Authentication
---

## signIn()

The `signIn` function checks the authentication and redirects to the login page if needed.

### Parameters

| Parameter     | Type          | Description                                                   |
|---------------|---------------|---------------------------------------------------------------|
| `router`   | `Router`      | The router of the application to redirect if needed.          |

### Usage

```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => signIn(inject(Router))),
    ...
  ]
}
```
