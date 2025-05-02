---
title: Query Intent Service
---

## Overview
The `QueryIntentService` allows getting the query intent for a query.

### getQueryIntent()

Retrieves the query intent data for a query and saves it in a cache.

```typescript
getQueryIntent(query: Query): Observable<QueryIntentMatch[]>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `query`| `Query`         | The query to fetch the query intent matches.                   |

**Usage Example:**

```typescript
queryIntentService.getQueryIntent(query).subscribe(matches => {
  console.log(matches);
});
```