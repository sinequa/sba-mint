---
title: AuthGuard
---

## Overview
Returns a guard function that checks if the user is authenticated.  
If the user is not authenticated, it navigates to the `login` route defined in the global configuration (by default the value is `/login`) when credentials are needed otherwise it navigates to the `loading` route to make an auto authentication.

:::warning
The routes `login` and `loading` must be declared in the routes configuration
:::

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
