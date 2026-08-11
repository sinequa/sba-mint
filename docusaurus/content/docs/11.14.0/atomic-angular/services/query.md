---
title: Query
---

The `QueryService` handles search queries, including fetching results and navigating between pages.

## Methods

### `search()`

Executes a search with the given query parameters.

```typescript
search(q?: Partial<Query>, includeQueryParams?: boolean, audit?: AuditEvents): Observable<Result>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `q` | `Partial<Query>` | | Partial query object to override current query parameters. |
| `includeQueryParams` | `boolean` | | Whether to include URL query parameters automatically. |
| `audit` | `AuditEvents` | | Audit events to associate with the search. |

**Returns** `Observable<Result>` — emits the search results.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { QueryService } from '@sinequa/atomic-angular';

inject(QueryService).search({ text: 'example' }).subscribe(results => {
  console.log(results);
});
```

### `bulkSearch()`

Executes multiple search queries in parallel.

```typescript
bulkSearch(q: Query[], audit?: AuditEvents): Observable<Result[]>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `q` | `Query[]` | ✓ | Array of query objects to execute. |
| `audit` | `AuditEvents` | | Audit events to associate with the searches. |

**Returns** `Observable<Result[]>` — emits an array of results in the same order as the input queries.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { QueryService } from '@sinequa/atomic-angular';

inject(QueryService).bulkSearch([{ text: 'example1' }, { text: 'example2' }]).subscribe(results => {
  console.log(results);
});
```

### `gotoPage()`

Navigates to the specified page number and triggers a new search.

```typescript
gotoPage(page: number): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `page` | `number` | ✓ | The page number to navigate to. |

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { QueryService } from '@sinequa/atomic-angular';

inject(QueryService).gotoPage(2);
```
