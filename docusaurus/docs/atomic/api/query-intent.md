---
title: Query Intent
sidebar_class_name: new
---

The Query Intent module provides a function to analyze a query and retrieve detected intent matches from the backend. Intent detection allows applications to understand what users are searching for and to adapt the search experience accordingly.

## Functions

### `fetchQueryIntent()`

Analyzes a query and returns detected intent matches.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `query` | `Query` | ✓ | The query object to analyze for intent |

**Returns** `Promise<QueryIntentMatch[]>` — array of detected query intent matches.

**Example**

```typescript title="fetch-query-intent.ts"
import { fetchQueryIntent } from '@sinequa/atomic';

const intents = await fetchQueryIntent({ name: '_query', text: 'annual report 2024' });

intents.forEach(intent => {
  console.log('Intent:', intent);
});
```

:::tip
Query intent results can be used to trigger specialized UI behaviors, such as showing a specific answer card or applying a predefined filter when a particular intent is detected.
:::
