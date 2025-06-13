---
title: Datasets
---

## Overview

The `datasets` module offers a suite of functions to interact with datasets through various web services. It allows users to fetch individual datasets, multiple datasets, and lists of dataset descriptions based on specific queries and parameters. This module is essential for applications that need to retrieve and manage data dynamically from different sources.

Key functionalities include:

- Fetching a single dataset with `fetchDataset`.
- Retrieving multiple datasets using `fetchDatasets`.
- Obtaining a list of dataset descriptions via `fetchDatasetList`.

These functions ensure that users can efficiently access and handle datasets as per their requirements.

### fetchDataset

Fetches a dataset from the specified web service and query name.

| **Parameters**      | **Type**   | **Description** |
|---------------------|------------|-----------------|
| `webserviceName`    | `string`   | The name of the web service to fetch the dataset from. |
| `queryName`         | `string`   | The name of the query to execute. |
| `parameters`        | `object`   | Optional parameters to pass to the query. Defaults to an empty object. |

| **Returns**         | **Description** |
|---------------------|-----------------|
| `Promise<T>`        | A promise that resolves to the fetched dataset. Where `T` is the type of the dataset, defaults to Result.  |

| **Throws**          | **Description** |
|---------------------|-----------------|
| `Error`             | If the dataset contains an error code and message. |

#### Example Fetching a Single Dataset

```javascript
import { fetchDataset } from 'datasets';

async function getSingleDataset() {
  try {
    const dataset = await fetchDataset('exampleService', 'exampleQuery', { param1: 'value1' });
    console.log(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
  }
}

getSingleDataset();
```

### fetchDatasets

Fetches datasets from a specified web service.

#### Parameters

| **Parameter**       | **Type**   | **Description**                                                                 |
|---------------------|------------|---------------------------------------------------------------------------------|
| `webserviceName`    | `string`   | The name of the web service to fetch datasets from.                             |
| `options`           | `{parameters?: {}, datasets?: string[]}`   | The options for the request.|

| **Options**         | **Type**   | **Description**                                                                 |
|---------------------|------------|---------------------------------------------------------------------------------|
| `parameters`        | `object`   | Optional. The body of the request, defaults to an empty object.                 |
| `datasets`          | `string[]` | Optional. An array of dataset names to fetch, defaults to an empty array.       |

#### Returns

- `Promise<DataSet<T>>`: A promise that resolves to the fetched datasets.

#### Example Fetching Multiple Datasets

```javascript
import { fetchDatasets } from 'datasets';

async function getMultipleDatasets() {
  try {
    const datasets = await fetchDatasets('exampleService', { 
      parameters: {value1: 'value1' }, 
      datasets: ['dataset1', 'dataset2']
    });
    console.log(datasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
  }
}

getMultipleDatasets();
```

### fetchDatasetList

Fetches a list of dataset descriptions from the specified web service.

#### Parameters

| **Parameter**       | **Type**   | **Description**                                                                 |
|---------------------|------------|---------------------------------------------------------------------------------|
| `webserviceName`    | `string`   | The name of the web service to fetch the dataset list from.                     |

#### Returns

- `Promise<DatasetDescription[]>`: A promise that resolves to an array of `DatasetDescription` objects.
This module provides functionality for retrieving and managing datasets based on user queries.

#### Example Fetching a List of Dataset Descriptions

```javascript
import { fetchDatasetList } from 'datasets';

async function getDatasetList() {
  try {
    const datasetList = await fetchDatasetList('exampleService');
    console.log(datasetList);
  } catch (error) {
    console.error('Error fetching dataset list:', error);
  }
}

getDatasetList();
```
