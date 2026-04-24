---
title: Query Parameters
---

This module provides utility functions for building, parsing, and serializing URL query parameters for search state management.

## Types

### `QueryParams`

A partial `Query` extended with URL-specific routing fields.

```typescript
type QueryParams = Partial<Omit<Query, 'filters'>> & {
  path?: string;
  filters: LegacyFilter[];
  id?: string;
};
```

## Functions

### `getQueryParamsFromUrl()`

Parses a URL string and returns a `QueryParams` object containing recognized search state fields.

```typescript
function getQueryParamsFromUrl(url: string | undefined): QueryParams | undefined
```

**Example**

```typescript
import { getQueryParamsFromUrl } from '@sinequa/atomic';

const params = getQueryParamsFromUrl(
  'https://example.com/search?q=test&f=%5B%7B%22field%22%3A%22type%22%2C%22value%22%3A%22doc%22%7D%5D&p=2&t=all'
);
// { path: '/search', text: 'test', filters: [{ field: 'type', value: 'doc' }], page: 2, tab: 'all' }
```

---

### `getUrlParamsFromQueryParams()`

Serializes a `QueryParams` object into a URL query string.

```typescript
function getUrlParamsFromQueryParams(queryParams: QueryParams | undefined): string
```

**Example**

```typescript
import { getUrlParamsFromQueryParams } from '@sinequa/atomic';

const qs = getUrlParamsFromQueryParams({
  text: 'example',
  filters: [{ field: 'type', value: 'document' }],
  page: 1,
  sort: 'relevance',
  tab: 'results',
  name: '_query'
});
// 'q=example&f=...&p=1&s=relevance&t=results&n=_query'
```

---

### `getFiltersFromUrl()`

Extracts the `LegacyFilter` array from the `f` parameter of a URL.

```typescript
function getFiltersFromUrl(url: string | undefined): LegacyFilter[]
```

---

### `getFiltersFromURI()`

Decodes and parses a URI-encoded filter string into a `LegacyFilter` array.

```typescript
function getFiltersFromURI(uri: string): LegacyFilter[]
```

---

### `queryParamsFromUrl()`

Returns all raw query parameters from a URL as a plain `Record<string, string>` object.

```typescript
function queryParamsFromUrl(url: string): Record<string, string>
```

**Example**

```typescript
import { queryParamsFromUrl } from '@sinequa/atomic';

queryParamsFromUrl('https://example.com/search?q=hello&p=2');
// { q: 'hello', p: '2' }
```

---

### `getQueryTextFromUrl()`

Extracts the query text (`q` parameter) from a URL.

```typescript
function getQueryTextFromUrl(url: string): string
```

---

### `getIdFromUrl()`

Extracts the document ID (`id` parameter) from a URL.

```typescript
function getIdFromUrl(url: string): string
```

---

### `getQueryPageFromUrl()`

Extracts the page number (`p` parameter) from a URL.

```typescript
function getQueryPageFromUrl(url: string): number
```

---

### `getQueryTabFromUrl()`

Extracts the active tab (`t` parameter) from a URL.

```typescript
function getQueryTabFromUrl(url: string): string
```
