---
title: Query Params Utilities
---

## Introduction

This module provides utility functions for extracting and parsing query parameters from URLs, especially for search and filter operations. It is useful for handling URL-based navigation and state in search-driven applications.

## Types

### QueryParams

Extends the base `Query` type with additional properties for path, filters, document id, and query name.

```typescript
export type QueryParams = Query & {
  path?: string;
  filters?: LegacyFilter[];
  id?: string;
  queryName?: string;
}
```

## Functions

### getQueryParamsFromUrl

Parses a URL string and returns a `QueryParams` object.

```typescript
function getQueryParamsFromUrl(url: string | undefined): QueryParams | undefined
```

### getFiltersFromUrl

Extracts an array of `LegacyFilter` objects from a URL string.

```typescript
function getFiltersFromUrl(url: string | undefined): LegacyFilter[]
```

### getFiltersFromURI

Parses a URI-encoded string and returns an array of `LegacyFilter` objects.

```typescript
function getFiltersFromURI(uri: string): LegacyFilter[]
```

### queryParamsFromUrl

Returns an object of query parameters from the given URL.

```typescript
function queryParamsFromUrl(url: string): Record<string, string>
```

## Example

```typescript
import { getQueryParamsFromUrl, getFiltersFromUrl } from '@sinequa/atomic';

const url = 'https://example.com/search?q=hello&f=%5B%7B%22field%22%3A%22type%22%2C%22value%22%3A%22document%22%7D%5D';
const params = getQueryParamsFromUrl(url);
// params: { path: '/search', text: 'hello', filters: [{ field: 'type', value: 'document' }], ... }

const filters = getFiltersFromUrl(url);
// filters: [{ field: 'type', value: 'document' }]
```

## Notes

- All functions expect valid URL or URI-encoded strings.
- The utilities are designed to work with Sinequa's query and filter types.
