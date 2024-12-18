---
title: QueryParams from URL
---

## Overview

This utility functions to extract query parameters and filters from a URL. These functions help in parsing and handling URL parameters efficiently.


## Get Query Params
### getQueryParamsFromUrl()

Extract params from the given URL and return a [`QueryParams`](#queryparams) Object which is a simplified `Query` Object.

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| url       | string | The URL to extract params from |


#### QueryParams
```ts
import { LegacyFilter, Query, SpellingCorrectionMode } from "@sinequa/atomic";

export type QueryParams = Query & {
  path?: string;
  filters?: LegacyFilter[];
  id?: string;
  queryName?: string;
}
```

#### Usage
```ts
const url = 'https://www.sinequa.com?q=hello&scope=web&sort=date&t=all&p=3';
const queryParams = getQueryParamsFromUrl(url);
console.log(queryParams);
// Output
{
  path: 'https://www.sinequa.com',
  text: 'hello',
  filters: undefined,
  page: 3,
  sort: 'date',
  tab: 'all',
  scope: 'web'
}
```

## Get filters
### getFiltersFromUrl()

Extract filters from the given URL and returns a `LegacyFilter` array.

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| url       | string | The URL to extract params from |

#### Usage
```ts
const url = 'https://www.sinequa.com/?q=Nikola%20Tesla&t=all&f=%5B%7B"field":"geo","value":"AMERICA","operator":"contains","display":"America"%7D%5D';
console.log(getFiltersFromUrl(url));
// Output
[
  {
    field: 'geo',
    value: 'AMERICA',
    operator: 'contains',
    display: 'America'
  }
]
```

### getFiltersFromURI()

Get a `LegacyFilter` array from URI string

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| uri       | string | The URI string to parse |

#### Usage
##### From an URL
```ts
const url = 'https://www.sinequa.com/?q=Nikola%20Tesla&t=all&f=%5B%7B"field":"geo","value":"AMERICA","operator":"contains","display":"America"%7D%5D';
const { f } = queryParamsFromUrl(url);  // retrieve filters URI value
console.log(getFiltersFromURI(f));      // convert URI value into a LegacyFilters[]
// Output
[
  {
    field: 'geo',
    value: 'AMERICA',
    operator: 'contains',
    display: 'America'
  }
]
```
##### From an URI value
```ts
const uri = '%5B%7B"field":"geo","value":"AMERICA","operator":"contains","display":"America"%7D%5D';
console.log(getFiltersFromURI(uri));
// Output
[
  {
    field: 'geo',
    value: 'AMERICA',
    operator: 'contains',
    display: 'America'
  }
]
```
:::tip
Same can be achieved with `getQueryParamsFromUrl()` 👇
```ts
const url = 'https://www.sinequa.com/?q=Nikola%20Tesla&t=all&f=%5B%7B"field":"geo","value":"AMERICA","operator":"contains","display":"America"%7D%5D';
const { filters } = getQueryParamsFromUrl(url) as { filters: [] };
console.log(filters);
// Output:
[
  {
    field: 'geo',
    value: 'AMERICA',
    operator: 'contains',
    display: 'America'
  }
]
```
:::

## Helpers

These functions are useful for parsing URLs and extracting specific query parameters, which can be helpful in various web development scenarios, such as filtering search results or navigating through paginated content.

### getQueryTextFromUrl()

Retrieves the query Text from a URL or undefined.

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| url       | string | The URL to extract params from |

#### Usage
```ts
const url = 'https://www.sinequa.com?q=hello&scope=web&sort=date&t=all&p=3';
const text  = getQueryTextFromUrl(url);
console.log(text);
// Output: "hello"
```

### getIdFromUrl()

Retrieves the query Id from a URL or undefined.

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| url       | string | The URL to extract params from |

#### Usage
```ts
const url = 'https://www.sinequa.com?q=hello&scope=web&sort=date&t=all&p=3&id=ref123';
const id  = getIdFromUrl(url);
console.log(id);
// Output: "ref123"
```

### getQueryPageFromUrl()

Retrieves the query Page from a URL.

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| url       | string | The URL to extract params from |

#### Usage
```ts
const url = 'https://www.sinequa.com?q=hello&scope=web&sort=date&t=all&p=3';
const page  = getQueryPageFromUrl(url);
console.log(page);
// Output: 3
```

### getQueryTabFromUrl()

Retrieves the query Tab from a URL.

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| url       | string | The URL to extract params from |

#### Usage
```ts
const url = 'https://www.sinequa.com?q=hello&scope=web&sort=date&t=all&p=3';
const tab  = getQueryTabFromUrl(url);
console.log(tab);
// Output: "all"
```