---
title: Fetch Query Export
---

This module provides functionality for exporting query results from the web service. It allows users to:

- Export query results based on specified parameters including the application name, query details, and optional article information.

These operations enable efficient export of search results, enhancing user experience in data handling and reporting scenarios.

## Functions

### fetchQueryExport()

Fetches the export of a query result from the web service.

| Parameter | Type | Description |
| --- | --- | --- |
| model | `ExportQueryModel` | The model containing export query details. |
| appName | `string` | The name of the application. |
| query | `Query` | The query to be exported. |
| article | `Article` | Optional article associated with the query. |

__Returns__ A promise that resolves to the response of the export request.

#### Example

```typescript
import { ExportQueryModel, Query, Article, fetchQueryExport } from '@sineuqa/atomic';

const appName: string = 'MyApplication';
const query: Query = {
  // populate with query details
};
const article: Article = {
  // populate with article details if necessary
};

const model: ExportQueryModel = {
  export: "Result",
  format: "Csv",
  webservice: "training_export",
  maxcount:10,
  exportedColumns: ["Title", "Filename", "Url"],
  filename: "myexport.csv"
}

// example 1: Fetch query export and log the response
const response = await fetchQueryExport({model, appName: "training", query: {name, text: searchText}, article })
console.log("response export", await response.text());

// example to download the file
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = model.filename || response.headers.get('Content-Disposition')?.split('filename=')[1].replace(/"/g, "") || 'export.csv';
document.body.appendChild(a);
a.click();
a.remove();
window.URL.revokeObjectURL(url);
```
