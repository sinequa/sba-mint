---
title: Aggregations
---

The `AggregationsService` is responsible for handling aggregation-related operations in the application. It provides methods to load more aggregation items, open aggregation nodes, and retrieve sorted aggregations based on a query name.

:::note
The functionality for retrieving sorted aggregations based on a query name is provided by the [`getAuthorizedFilters`](../stores/app.mdx#getauthorizedfilters) method in the [`AppStore`](../stores/app.mdx), not in this service.
See the AppStore documentation for details on retrieving sorted aggregations.
:::

## Functions

### loadMore()

Loads more items for a given aggregation.

#### Parameters

| Parameter     | Type                | Description                                                                 |
|---------------|---------------------|-----------------------------------------------------------------------------|
| `query`       | `Partial<Query>`    | The query object containing the current query parameters.                   |
| `aggregation` | `Aggregation`       | The aggregation object for which more items need to be loaded.              |
| `audit`       | `AuditEvents`       | (Optional) Audit events to be recorded.                                     |

#### Returns

| Type                | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `Observable<Aggregation>` | An observable that emits the updated aggregation with more items.     |

### open()

Opens a node in a tree aggregation.

#### Parameters

| Parameter     | Type                    | Description                                                                 |
|---------------|-------------------------|-----------------------------------------------------------------------------|
| `query`       | `Partial<Query>`        | The query object containing the current query parameters.                   |
| `aggregation` | `TreeAggregation`       | The tree aggregation object containing the node to be opened.               |
| `item`        | `TreeAggregationNode`   | The node to be opened.                                                      |

#### Returns

| Type                    | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `Observable<TreeAggregation>` | An observable that emits the updated tree aggregation with the node opened. |

## Example

```typescript
import { AggregationsService } from './services/aggregations.service';

constructor(private aggregationsService: AggregationsService) {}

loadMoreAggregations() {
  const query = { /* query parameters */ };
  const aggregation = { /* aggregation object */ };
  
  this.aggregationsService.loadMore(query, aggregation).subscribe(updatedAggregation => {
    console.log(updatedAggregation);
  });
}

openAggregationNode() {
  const query = { /* query parameters */ };
  const aggregation = { /* tree aggregation object */ };
  const item = { /* tree aggregation node */ };
  
  this.aggregationsService.open(query, aggregation, item).subscribe(updatedAggregation => {
    console.log(updatedAggregation);
  });
}

// To get sorted aggregations, use the AppStore instead
getAuthorizedFilters() {
  const route = this.router.routerState.root;
  const sortedAggregations = this.appStore.getAuthorizedFilters(route);
  console.log(sortedAggregations);
}
```
