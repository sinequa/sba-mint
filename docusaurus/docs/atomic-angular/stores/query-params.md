---
title: Query Params
---

## Overview

This store is used to manage the query parameters. It is used to store the query parameters for the current page.

## Basic Features

### setFromUrl()

Sets the state from the given URL by extracting query parameters and updating the store.

```typescript
setFromUrl(url: string): void
```

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| url       | string | The URL from which to extract params |


### updateFilter()

Updates the filter with the given value.

```typescript
updateFilter(filter: LegacyFilter): void
```

| Parameter | Type         | Description          |
|-----------|--------------|----------------------|
| filter    | LegacyFilter | The filter to update |

### clearFilter()

Clears the filter.

```typescript
clearFilter(): void
```

### patch()

Patches the query parameters with the given value.

```typescript
patch(params: Partial<QueryParams>): void
```

| Parameter | Type              | Description          |
|-----------|-------------------|----------------------|
| params    | QueryParams | The params to patch |

### getFilterFromColumn()

Gets the filter from the column.

```typescript
getFilterFromColumn(column: string): LegacyFilter | undefined
```

| Parameter | Type   | Description          |
|-----------|--------|----------------------|
| column    | string | The column to filter |

### getQuery()

Constructs and returns a query object based on the current state of the store.
  
  ```typescript
  getQuery(): Query
  ```
