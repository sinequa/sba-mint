---
title: QueryNameResolver
---

## Overview
Resolves the name of the default query from the application store.

:::note
When the function resolves, returns the name of the first query defined in the administration.
:::

### Usage
```ts title="routes.ts"
export const route: Routes = [
  { 
    path: 'home', 
    component: Home, 
    resolve: { queryName: queryNameResolver }
  }
  ...
]
```
