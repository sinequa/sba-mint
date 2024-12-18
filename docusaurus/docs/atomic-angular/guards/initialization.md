---
title: InitializationGuard
---

## Overview
InitializationGuard is a route guard that ensures the application is ready before allowing navigation to a requested page.

This guard checks if the application is fully initialized by verifying the readiness of the ApplicationStore.
If the application is not ready, it redirects the user to a loading page and prevents navigation to the requested page.

:::warning
The route `loading` must be declared in the routes configuration
:::

### Usage
```ts
const routes: Routes = [
  {
    path: 'some-path',
    component: SomeComponent,
    canActivate: [InitializationGuard()]
  },
  { path: 'loading', component: Loading } // used by the auto authentication
];
```