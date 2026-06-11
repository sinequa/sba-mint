---
title: Query Intent
sidebar_class_name: update
---

The `QueryIntentService` analyzes queries to identify their intent. It maintains an internal cache to avoid analyzing the same query text multiple times.

## Methods

### `getQueryIntent()`

Retrieves query intent matches for a given query.

```typescript
getQueryIntent(query: Query): Observable<QueryIntentMatch[]>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `query` | `Query` | ✓ | The query to analyze for intent. |

**Returns** `Observable<QueryIntentMatch[]>` — emits an array of intent matches. Returns an empty array immediately if the query text is empty.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { QueryIntentService } from '@sinequa/atomic-angular';

inject(QueryIntentService).getQueryIntent(query).subscribe(intents => {
  console.log(intents);
});
```
