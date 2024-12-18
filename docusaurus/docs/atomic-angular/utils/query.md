---
title: Query
---

## Overview

### getQueryNameFromRoute

Retrieve the query's name from the __search__ Route recursively.  
If no `queryName` property can be found, returns _undefined_ value

:::important
This function must be called in an injection context.
:::

#### Usage
```ts title="routes configuration"
const routes: Routes = [
  {
    path: "search", component: Search,
    children: [
      {
        path: "all",
        component: SearchAll,
        data: { queryName: "_query" }
      }
      ...
    ]
  }
  ...
]
```

```ts
// somewhere in a injection context
const name = getQueryNameFromRoute();
// Output: "_query"
```



### buildQuery

Builds a query object based on the provided partial query and the current URL.

:::important
This function must be called in an injection context.
:::

#### Usage
##### Default usage

Assuming we are using the same [routes configuration](#usage)

```ts title="default.ts"
// the current url is: https://localhost:4200/#/search/all?q=Nikola%20Tesla&t=all"

const query = buildQuery();
// Output: { name: "_query", text: "Nikola Tesla", tab: "all" }
```
##### Override query properties
```ts title="override.ts"
// the current url is: https://localhost:4200/#/search/all?q=Nikola%20Tesla&t=all"

const query = buildQuery({ name: "my-query", tab: "people" });
// Output: { name: "my-query", text: "Nikola Tesla", tab: "people" }
```
