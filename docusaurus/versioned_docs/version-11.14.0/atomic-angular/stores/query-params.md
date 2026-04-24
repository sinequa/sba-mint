---
title: Query Params
---

The `QueryParamsStore` manages the current URL query parameters (search text, filters, page, basket, etc.).

## Methods

### `setFromUrl()`

Parses a URL and updates the store state from its query parameters.

```typescript
setFromUrl(url: string): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL from which to extract query parameters. |

### `addFilter()`

Adds a filter to the current state.

```typescript
addFilter(filter: LegacyFilter): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `filter` | `LegacyFilter` | ✓ | The filter to add. |

### `updateFilter()`

Updates an existing filter in the store.

```typescript
updateFilter(filter: LegacyFilter): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `filter` | `LegacyFilter` | ✓ | The updated filter. |

### `clearFilter()`

Removes all active filters.

```typescript
clearFilter(): void
```

### `clearBasket()`

Removes the basket from the state.

```typescript
clearBasket(): void
```

### `patch()`

Merges the provided partial state into the current state.

```typescript
patch(params: Partial<QueryParamsState>): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `params` | `Partial<QueryParamsState>` | ✓ | The parameters to merge. |

### `getFilter()`

Retrieves a filter by field or name.

```typescript
getFilter({ field, name }: { field: string | undefined; name: string | undefined }): Partial<LegacyFilter & { count: number }> | null
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `field` | `string \| undefined` | | The field key to search for. |
| `name` | `string \| undefined` | | The filter name to search for. |

**Returns** `Partial<LegacyFilter & { count: number }> | null` — the matching filter or `null`.
