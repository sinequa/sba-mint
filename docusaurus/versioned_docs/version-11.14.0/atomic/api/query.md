---
title: Query
sidebar_class_name: update
---

The Query module provides functions to execute search queries against the Sinequa backend. It supports single and bulk query execution, optional audit event recording, and query intent analysis integration.

The results are automatically enriched with:
- `$hasMore` on each aggregation (indicates whether more items are available)
- `$path` and `$level` on tree aggregation nodes
- `value` and `type` on each article record
- `nextPage` / `previousPage` pagination helpers

## Functions

### `fetchQuery()`

Executes a single query and returns the results.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `query` | `Query` | ✓ | The query object to execute |
| `audit` | `AuditEvents` | | Audit events to record with this query |
| `queryIntentData` | `QueryIntentData` | | Additional intent data to send with the query |

**Returns** `Promise<Result>` — the query results, enriched with pagination helpers (`nextPage`, `previousPage`).

**Example**

```typescript title="fetch-query.ts"
import { fetchQuery } from '@sinequa/atomic';

const result = await fetchQuery({
  name: '_query',
  text: 'hello world',
  pageSize: 10,
  page: 1
});

console.log(result.records);
console.log(result.rowCount);
console.log(result.nextPage); // next page number or undefined
```

---

### `fetchBulkQuery()`

Executes multiple queries in parallel and returns an array of results.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `queries` | `Query[]` | ✓ | Array of query objects to execute |
| `mode` | `'parallel'` | | Execution mode. Default: `'parallel'` |
| `auditEvents` | `AuditEvents` | | Audit events to record with the bulk request |

**Returns** `Promise<Result[]>` — array of results in the same order as the input queries, each enriched with pagination helpers.

**Example**

```typescript title="fetch-bulk-query.ts"
import { fetchBulkQuery } from '@sinequa/atomic';

const baseQuery = { name: '_query', pageSize: 10, text: 'tesla' };

const [page1, page2, altQuery] = await fetchBulkQuery([
  { ...baseQuery, page: 1 },
  { ...baseQuery, page: 2 },
  { ...baseQuery, name: '_query_test', page: 1 }
]);

console.log(page1.rowCount);
console.log(page2.records);
```
