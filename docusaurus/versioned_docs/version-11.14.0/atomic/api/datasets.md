---
title: Datasets
sidebar_class_name: update
---

The Datasets module provides functions to fetch data from Sinequa dataset web services. It supports individual dataset retrieval, bulk fetching, and listing available datasets.

## Functions

### `fetchDataset<T>()`

Fetches a single dataset from a named web service.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `webserviceName` | `string` | ✓ | Name of the dataset web service |
| `queryName` | `string` | ✓ | Name of the query to execute within the service |
| `parameters` | `object` | | Additional parameters to pass to the query. Default: `{}` |

**Returns** `Promise<T>` — the fetched dataset. Defaults to `Result` if no type parameter is provided.

**Example**

```typescript title="fetch-dataset.ts"
import { fetchDataset } from '@sinequa/atomic';

const dataset = await fetchDataset('myDatasetService', 'myQuery', { param1: 'value1' });
console.log(dataset);
```

---

### `fetchDatasets<T>()`

Fetches one or more named datasets from a web service in a single request.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `webserviceName` | `string` | ✓ | Name of the dataset web service |
| `options` | `object` | ✓ | Fetch options |
| `options.parameters` | `object` | | Request body parameters. Default: `{}` |
| `options.datasets` | `string[]` | | Names of datasets to fetch. Default: `[]` |

**Returns** `Promise<DataSet<T>>` — the fetched datasets keyed by name.

**Example**

```typescript title="fetch-datasets.ts"
import { fetchDatasets } from '@sinequa/atomic';

const result = await fetchDatasets('myService', {
  parameters: { filter: 'active' },
  datasets: ['dataset1', 'dataset2']
});
console.log(result);
```

---

### `fetchDatasetList()`

Fetches the list of dataset descriptions available in a given web service.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `webserviceName` | `string` | ✓ | Name of the dataset web service |

**Returns** `Promise<DatasetDescription[]>` — array of dataset descriptions.

**Example**

```typescript title="fetch-dataset-list.ts"
import { fetchDatasetList } from '@sinequa/atomic';

const datasets = await fetchDatasetList('myService');
datasets.forEach(d => console.log(d.name, d.description));
```
