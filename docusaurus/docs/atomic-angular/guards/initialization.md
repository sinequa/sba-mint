---
title: InitializationGuard
---

The `InitializationGuard` is a functional route guard that ensures the application is ready before allowing navigation to a requested page.

### Key features

- Returns a `CanActivateFn` function (Angular's modern functional guard approach)
- Checks if the application is fully initialized by verifying the readiness of the `ApplicationStore`
- If the application is not ready, redirects the user to a loading page and prevents navigation to the requested page

:::warning
The route `loading` must be declared in your routes configuration.
:::

### Configuration

The guard uses the following:

- `ApplicationStore.ready()`: Determines if the application is ready for navigation

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
