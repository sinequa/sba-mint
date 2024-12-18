---
title: Query
---

## Overview
The Query API provides functions for fetching data from the backend. These functions allow you to execute single or multiple queries, retrieve results, and optionally record audit events. The API supports both individual and bulk query operations, enabling efficient data retrieval for various use cases.


### fetchQuery()
Fetches data from the backend using the specified query.

__Returns__ A promise that resolves to the fetched data.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| query | `string` | The query string to be executed on the backend |
| audit | `AuditEvents` | Optional. audit event to be recorded with the save action. |
| queryItentData | `QueryIntentData` | Optional. Additional data to be sent with the query for intent processing |

__Returns__ A promise that resolves to the query results.

#### Example
```js title="example-fetch-query.js"
import { fetchQuery } from "@sinequa/atomic";

const query = {
  "name":"_query",
  "text":"hello world",
}

fetchQuery(query)
  .then((data) => console.log("data", data))
  .catch((error) => console.log("error", error))
```

### fetchBulkQuery()

Fetches multiple queries in bulk from the backend.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| queries | `Query[]` | An array of query objects to be executed on the backend |
| mode | `"parallel"` | Optional. Specifies the execution mode. If set to "parallel", queries are executed concurrently. Default is "parallel". |
| auditEvents | `AuditEvents` | Optional. Audit events to be recorded with the bulk query action. |

__Returns__ A promise that resolves to an array of query results, corresponding to the input queries.

#### Example
```js title="example-fetch-bulk-query.js"
import { fetchBulkQuery } from "@sinequa/atomic";

const query = {
  "name": "_query",
  "pageSize": 20,
  "text": "tesla",
  "page": 1
};

fetchBulkQuery([
  query,
  {...query, page: 2},
  {...query, name: '_query_test', page: 4}
  ])
  .then((data) => console.log("data", data))
  .catch((error) => console.log("error", error));
```