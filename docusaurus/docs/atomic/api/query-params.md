---
title: Query Params from URL
---

This module provides utility functions to extract and parse query parameters and filters from a URL string. These helpers are useful for restoring search state from a URL (e.g., when sharing or bookmarking a search result page).

## Types

### `QueryParams`

A simplified `Query` object extended with URL-specific fields:

```typescript
type QueryParams = Query & {
  path?: string;
  filters?: LegacyFilter[];
  id?: string;
  queryName?: string;
};
```

## Functions

### `getQueryParamsFromUrl()`

Parses a URL and returns a `QueryParams` object containing all recognized query parameters.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL to parse |

**Returns** `QueryParams` — parsed query parameters.

**Example**

```typescript title="get-query-params.ts"
import { getQueryParamsFromUrl } from '@sinequa/atomic';

const params = getQueryParamsFromUrl(
  'https://myapp.com/search?q=hello&scope=web&sort=date&t=all&p=3'
);
// {
//   path: 'https://myapp.com/search',
//   text: 'hello',
//   page: 3,
//   sort: 'date',
//   tab: 'all',
//   scope: 'web'
// }
```

---

### `getFiltersFromUrl()`

Extracts the `LegacyFilter` array from a URL's `f` parameter.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL containing filters in the `f` parameter |

**Returns** `LegacyFilter[]` — array of parsed legacy filters.

**Example**

```typescript title="get-filters-from-url.ts"
import { getFiltersFromUrl } from '@sinequa/atomic';

const url = 'https://myapp.com/search?q=Tesla&f=%5B%7B"field":"geo","value":"AMERICA"%7D%5D';
const filters = getFiltersFromUrl(url);
// [{ field: 'geo', value: 'AMERICA' }]
```

---

### `getFiltersFromURI()`

Parses a URI-encoded filter string directly into a `LegacyFilter` array.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `uri` | `string` | ✓ | URI-encoded filter string (the raw value of the `f` parameter) |

**Returns** `LegacyFilter[]` — array of parsed legacy filters.

**Example**

```typescript title="get-filters-from-uri.ts"
import { getFiltersFromURI } from '@sinequa/atomic';

const uri = '%5B%7B"field":"geo","value":"AMERICA"%7D%5D';
const filters = getFiltersFromURI(uri);
// [{ field: 'geo', value: 'AMERICA' }]
```

---

## Helper Functions

### `getQueryTextFromUrl()`

Extracts the query text (`q` parameter) from a URL.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL to parse |

**Returns** `string | undefined`

**Example**

```typescript
getQueryTextFromUrl('https://myapp.com?q=hello&p=2');
// 'hello'
```

---

### `getIdFromUrl()`

Extracts the document ID (`id` parameter) from a URL.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL to parse |

**Returns** `string | undefined`

---

### `getQueryPageFromUrl()`

Extracts the page number (`p` parameter) from a URL.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL to parse |

**Returns** `number`

---

### `getQueryTabFromUrl()`

Extracts the active tab (`t` parameter) from a URL.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL to parse |

**Returns** `string | undefined`
