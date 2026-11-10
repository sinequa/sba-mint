---
title: Aggregations
---

The Aggregations module provides a function to fetch updated aggregation data for a specific facet based on the current query. This is useful for refreshing a single aggregation independently of the full query execution.

## Functions

### `fetchAggregation()`

Fetches the current state of an aggregation for the given query.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `aggregation` | `Aggregation` | ✓ | The aggregation to refresh |
| `query` | `Query` | ✓ | The current query context |
| `audit` | `AuditEvents` | | Audit events to record with the request |

**Returns** `Promise<Aggregation>` — the refreshed aggregation.

**Example**

```typescript title="fetch-aggregation.ts"
import { fetchAggregation } from '@sinequa/atomic';

const aggregation = {
  name: 'Modified',
  isTree: false,
  items: []
};

const query = {
  name: '_query',
  text: 'tesla'
};

const result = await fetchAggregation(aggregation, query, {
  type: 'Search_Text',
  detail: { querytext: query.text }
});

console.log('Aggregation items:', result.items);
```
