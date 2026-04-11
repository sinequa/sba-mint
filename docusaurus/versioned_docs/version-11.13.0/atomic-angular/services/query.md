---
title: Query
sidebar_class_name: update
---

The `QueryService` is responsible for handling search queries, including fetching and displaying search results.

## Functions

### search()

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
import { inject } from "@angular/core";
import { QueryService } from "@sinequa/atomic-angular";

const queryService = inject(QueryService);
queryService.search({ text: 'example' }).subscribe(results => {
  console.log(results);
});
```

### bulkSearch()

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
import { inject } from "@angular/core";
import { QueryService } from "@sinequa/atomic-angular";

const queryService = inject(QueryService);
queryService.bulkSearch([{ text: 'example1' }, { text: 'example2' }]).subscribe(results => {
  console.log(results);
});
```

### gotoPage()

Navigates to the specified page and returns the search result.

```typescript
gotoPage(page: number): void
```

| Parameter | Type     | Description                  |
|-----------|----------|------------------------------|
| `page`    | `number` | The page number to navigate to. |

**Usage Example:**

```typescript
import { inject } from "@angular/core";
import { QueryService } from "@sinequa/atomic-angular";

const queryService = inject(QueryService);
queryService.gotoPage(2);
```

This method updates the page number in the query parameters store and audit information about the page navigation.
