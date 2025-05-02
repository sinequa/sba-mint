---
title: Query Service
---

## Overview
The `QueryService` is responsible for handling search queries, including fetching and displaying search results.

### search()

Performs a search query.

```typescript
search(q?: Partial<Query>, includeQueryParams?: boolean, audit?: AuditEvents): Observable<Result>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `q`                 | `Partial<Query>`    | (Optional) The partial query object.                                        |
| `includeQueryParams`| `boolean`           | (Optional) Indicates whether to include query parameters automatically.     |
| `audit`             | `AuditEvents`       | (Optional) The audit events object.                                         |

**Usage Example:**

```typescript
this.queryService.search({ text: 'example' }).subscribe(results => {
  console.log(results);
});
```

### bulkSearch()

Performs a bulk search operation.

```typescript
bulkSearch(q: Query[], audit?: AuditEvents): Observable<Result[]>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `q`     | `Query[]`     | An array of Query objects representing the search queries. |
| `audit` | `AuditEvents` | (Optional) An object for auditing purposes.             |

**Usage Example:**

```typescript
this.queryService.bulkSearch([
  { text: 'example1' },
  { text: 'example2' }
]).subscribe(results => {
  console.log(results);
});
```
