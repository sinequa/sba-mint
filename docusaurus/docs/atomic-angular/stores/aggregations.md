---
title: Aggregations
sidebar_class_name: update
---

Each time a search is performed, the result's aggregations are stored in this store. This makes it easier to access aggregation data directly rather than from the `Result` object.

## Methods

### `update()`

Replaces the current aggregations state with the provided array.

```typescript
update(aggregations: Aggregation[]): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `aggregations` | `Aggregation[]` | ✓ | The new aggregations to set. |

### `updateAggregation()`

Updates a single aggregation in the store by matching its name.

```typescript
updateAggregation(aggregation: Aggregation): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `aggregation` | `Aggregation` | ✓ | The aggregation to update. |

### `clear()`

Resets the aggregations to an empty array.

```typescript
clear(): void
```

### `getAggregation()`

Retrieves an aggregation by name or column.

```typescript
getAggregation(name: string, kind?: 'column' | 'name'): Aggregation
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `name` | `string` | ✓ | The name or column of the aggregation to retrieve. |
| `kind` | `'column' \| 'name'` | | Whether `name` refers to the aggregation name or column. Default: `'name'`. |

**Returns** `Aggregation` — the matching aggregation.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AggregationsStore } from '@sinequa/atomic-angular';

const agg = inject(AggregationsStore).getAggregation('geo', 'column');
```
