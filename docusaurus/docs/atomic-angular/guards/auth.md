---
title: AuthGuard
---

## Overview

The `AuthGuard` is a functional route guard that checks if the user is authenticated before allowing access to protected routes.

Key features:

- Returns a `CanActivateFn` function (Angular's modern functional guard approach)
- Checks authentication status using `isAuthenticated()` from `@sinequa/atomic`
- Handles different authentication scenarios based on global configuration:
  - When using SSO authentication, always allows access
  - When using credentials, redirects to the login page defined in `globalConfig.loginPath`
  - Otherwise, redirects to a loading page for auto authentication

:::warning
The routes specified in `loginPath` (default: '/login') and 'loading' must be declared in your routes configuration.
:::

### Configuration

The guard uses the following properties from `globalConfig`:

- `loginPath`: The path to redirect to when authentication is needed (default: '/login')
- `useCredentials`: Whether the application uses credential-based authentication
- `useSSO`: Whether the application uses Single Sign-On authentication

### Usage

```ts
export const routes: Routes = [
  { 
    path: 'some-path', 
    component: SomeComponent, 
    canActivate: [AuthGuard()] 
  },
  { path: 'login', component: Login },    // used when using credentials
  { path: 'loading', component: Loading } // used by the auto authentication
]
```
