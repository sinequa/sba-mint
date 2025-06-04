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

### addFilter()

Adds a filter to the store's state.

```typescript
addFilter(filter: LegacyFilter): void
```

| Parameter | Type         | Description          |
|-----------|--------------|----------------------|
| filter    | LegacyFilter | The filter to add    |

### addFilter()

Adds a filter to the store's state.

```typescript
addFilter(filter: LegacyFilter): void
```

| Parameter | Type         | Description          |
|-----------|--------------|----------------------|
| filter    | LegacyFilter | The filter to be added to the state |

### updateFilter()

Updates the filter with the given value.

```typescript
updateFilter(filter: LegacyFilter): void
```

| Parameter | Type         | Description          |
|-----------|--------------|----------------------|
| filter    | LegacyFilter | The filter to update |

### removeFilter()

Removes a filter from the store based on the specified field.

```typescript
removeFilter(field?: string): void
```

| Parameter | Type         | Description          |
|-----------|--------------|----------------------|
| field    | string | The field of the filter to be removed |

### removeFilterByName()

Removes a filter from the state by its name.

```typescript
removeFilterByName(name?: string): void
```

| Parameter | Type         | Description          |
|-----------|--------------|----------------------|
| name    | string | The name of the filter to be removed |

### clearFilter()

Clears the filter.

```typescript
clearFilter(): void
```

### clearBasket()

Clears the basket from the state.

```typescript
clearBasket(): void
```

### patch()

Patches the query parameters with the given value.

```typescript
patch(params: Partial<QueryParamsState>): void
```

| Parameter | Type                     | Description                |
|-----------|--------------------------|----------------------------|
| params    | Partial\<QueryParamsState\> | The parameters to patch with |

### getFilter()

Retrieves a filter object based on the provided field or name.

```typescript
getFilter({ field, name }: { field: string | undefined; name: string | undefined }): Partial<LegacyFilter & { count: number }> | null
```

| Parameter     | Type    | Description                          |
|---------------|---------|--------------------------------------|
| field         | string  | The field to search for in filters   |
| name          | string  | The name to search for in filters    |
