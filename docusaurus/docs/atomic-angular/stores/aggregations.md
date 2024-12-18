---
title: Aggregations
---

## Overview

Each time a search is performed, the result's aggregations are stored in this store.
It is thus easier to access this information directly than from the `Result` object returned by the backend.

## Basic features

### update()

Updates the state with the provided aggregations.
  
  ```typescript
  update(aggregations: Aggregation[]): void
  ```

| parameter    | type           | description                                      |
|--------------|----------------|--------------------------------------------------|
| aggregations | Aggregation[]  | The new aggregations to update the state with.   |

### clear()

Clears the aggregations in the store by setting the `aggregations` property to an empty array.
  
  ```typescript
  clear(): void
  ```


:::info
This method uses the `patchState` function to update the state of the store.
:::

### getAggregation()

Retrieves an aggregation by name or column.
  
  ```typescript
  getAggregation(name: string, kind?: 'column' | 'name'): Aggregation
  ```
  

| parameter | type   | description                                      |
|-----------|--------|--------------------------------------------------|
| name      | string | The name or column of the aggregation to retrieve.|
| kind      | `column` \| `name` | The kind of the name parameter. Default is aggregation's __"name"__.|
