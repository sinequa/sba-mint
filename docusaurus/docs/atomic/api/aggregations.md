---
title: Aggregations
---

## Overview
This module provides functionality for retrieving and managing aggregations based on user queries. It enables:

- Fetching aggregated data for specific queries
- Applying filters and parameters to refine aggregation results
- Optionally logging audit events with aggregation requests

These operations allow for efficient data analysis and visualization, enhancing the ability to gain insights from search results and improve the overall user experience.

## Aggregations

### fetchAggregation()
Fetches an aggregation based on the provided parameters.

| Parameter | Type | Description |
| --- | --- | --- |
| aggregation | `Aggregation` | The aggregation to fetch. |
| query | `Query` | The query object to use for fetching the aggregation. |
| audit | `AuditEvents` | Optional. Audit events to be logged with the request. |

__Returns__ A promise&lt;Aggregation&gt; that resolves to the fetched aggregation.

#### Example
```js title="fetch-aggregation"
import { fetchAggregation } from '@sinequa/atomic';

// Example usage
const aggregation = {
  name: 'userStats',
  isTree: false,
  items: []
};

const query = {
  name: "_query",
  text: "tesla",
};

const audit = {
  type: "Search_Text",
  details: {
    querytext: query.text
  }
};

const result = await fetchAggregation(aggregation, query, audit);
console.log('Fetched aggregation:', result);
// Output: an Aggregation object type
```