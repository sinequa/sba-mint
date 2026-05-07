---
title: Query Intent
---

The `QueryIntentService` is responsible for analyzing queries to identify their intent. It maintains a cache to prevent analyzing the same query multiple times.

## Functions

### getQueryIntent()

Retrieves query intent matches for a given query.

```typescript
getQueryIntent(query: Query): Observable<QueryIntentMatch[]>
```

| Parameter | Type    | Description                          |
|-----------|---------|--------------------------------------|
| `query`   | `Query` | The query to analyze for intent.     |

#### Returns

`Observable<QueryIntentMatch[]>` - An observable that emits an array of query intent matches.

**Usage Example:**

```typescript
queryIntentService.getQueryIntent(query).subscribe(intents => {
  console.log(intents);
});
```

The service maintains an internal cache to prevent analyzing the same query text multiple times. If the query text is empty, an empty array will be returned immediately.
