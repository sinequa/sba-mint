---
title: Aggregations Service
---

## Overview
The `AggregationsService` is responsible for handling aggregation-related operations in the application. It provides methods to load more aggregation items, open aggregation nodes, and retrieve sorted aggregations based on a query name.

### loadMore()

Loads more items for a given aggregation.

```typescript
loadMore(
  query: Partial<Query>,
  aggregation: Aggregation,
  audit?: AuditEvents
): Observable<Aggregation>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `query`              | `Query`          | The query object containing the current query parameters.                                 |
| `aggregation` | `Aggregation`         | The aggregation object for which more items need to be loaded.                  |
| `audit`| `AuditEvents`         | (Optional) Audit events to be recorded                   |

**Usage Example:**

```typescript
aggregationsService.loadMore(
  query,
  aggregation
).subscribe(agg => {
  console.log(agg);
});
```
### open()

Opens a node in a tree aggregation.

```typescript
open(
  query: Partial<Query>,
  aggregation: TreeAggregation,
  item: TreeAggregationNode
): Observable<TreeAggregation>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `query`              | `Query`          | The query object containing the current query parameters.                                 |
| `aggregation` | `Aggregation`         | The tree aggregation object containing the node to be opened.                  |
| `item`| `TreeAggregationNode`         | The node to be opened.                   |

**Usage Example:**

```typescript
const agg = await firstValueFrom(this.aggregationsService.open(query, aggregation, node));
this.aggregationsStore.updateAggregation(agg);
```
