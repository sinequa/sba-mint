---
title: Query Service
---

## Overview

The `QueryService` is responsible for handling search queries, including fetching and displaying search results.

### search

```typescript
search(q?: Partial<Query>, includeQueryParams?: boolean, audit?: AuditEvents): Observable<Result>
```

| Name                | Type                | Description                                                                 |
|---------------------|---------------------|-----------------------------------------------------------------------------|
| `q`                 | `Partial<Query>`    | (Optional) The partial query object.                                        |
| `includeQueryParams`| `boolean`           | (Optional) Indicates whether to include query parameters automatically.     |
| `audit`             | `AuditEvents`       | (Optional) The audit events object.                                         |

#### Returns

`Observable<Result>` - An observable that emits the search results.

#### Usage

```typescript
this.queryService.search({ text: 'example' }).subscribe(results => {
  console.log(results);
});
```

### bulkSearch

```typescript
bulkSearch(q: Query[], audit?: AuditEvents): Observable<Result[]>
```

| Name    | Type          | Description                                             |
|---------|---------------|---------------------------------------------------------|
| `q`     | `Query[]`     | An array of Query objects representing the search queries. |
| `audit` | `AuditEvents` | (Optional) An object for auditing purposes.             |

#### Returns

`Observable<Result[]>` - An observable that emits an array of Result objects.

#### Usage

```typescript
this.queryService.bulkSearch([{ text: 'example1' }, { text: 'example2' }]).subscribe(results => {
  console.log(results);
});
```
