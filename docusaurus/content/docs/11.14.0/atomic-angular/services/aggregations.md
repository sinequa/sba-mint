---
title: Aggregations
sidebar_class_name: update
---

The `AggregationsService` handles aggregation-related operations: loading more items in a flat aggregation or opening a node in a tree aggregation.

:::note
Retrieving sorted aggregations based on a query name is provided by [`getAuthorizedFilters()`](../stores/app.mdx#getauthorizedfilters) in `AppStore`, not in this service.
:::

## Methods

### `loadMore()`

Loads more items for a given aggregation.

```typescript
loadMore(query: Partial<Query>, aggregation: Aggregation, audit?: AuditEvents): Observable<Aggregation>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `query` | `Partial<Query>` | ✓ | The current query parameters. |
| `aggregation` | `Aggregation` | ✓ | The aggregation for which to load more items. |
| `audit` | `AuditEvents` | | Optional audit events to record. |

**Returns** `Observable<Aggregation>` — emits the updated aggregation with additional items.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AggregationsService } from '@sinequa/atomic-angular';

const aggregationsService = inject(AggregationsService);

aggregationsService.loadMore(query, aggregation).subscribe(updated => {
  console.log(updated);
});
```

### `open()`

Opens a node in a tree aggregation to reveal its children.

```typescript
open(query: Partial<Query>, aggregation: TreeAggregation, item: TreeAggregationNode): Observable<TreeAggregation>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `query` | `Partial<Query>` | ✓ | The current query parameters. |
| `aggregation` | `TreeAggregation` | ✓ | The tree aggregation containing the node to open. |
| `item` | `TreeAggregationNode` | ✓ | The node to open. |

**Returns** `Observable<TreeAggregation>` — emits the updated tree aggregation with the node opened.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AggregationsService } from '@sinequa/atomic-angular';

const aggregationsService = inject(AggregationsService);

aggregationsService.open(query, treeAggregation, node).subscribe(updated => {
  console.log(updated);
});
```
