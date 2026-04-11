---
title: Export
sidebar_class_name: update
---

The Export module provides a function to export query results in various formats (CSV, XLSX, etc.) from the Sinequa backend.

## Functions

### `fetchQueryExport()`

Exports query results according to the provided model and returns the raw `Response` for download handling.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `model` | `ExportQueryModel` | ✓ | Export configuration (format, columns, limits, etc.) |
| `appName` | `string` | ✓ | The Sinequa application name |
| `query` | `Query` | ✓ | The query whose results should be exported |
| `article` | `Article` | | Optional article associated with the query (for selection exports) |

**Returns** `Promise<Response>` — the raw HTTP response. Use `.blob()` or `.text()` to access the file content.

```typescript title="ExportQueryModel type"
type ExportQueryModel = {
  export: ExportSourceType;   // 'Result' | 'Selection' | ...
  format: ExportOutputFormat; // 'Csv' | 'Xlsx' | ...
  webservice: string;
  maxcount: number;
  exportedColumns: string[];
  filename?: string;
};
```

**Example**

```typescript title="export-query.ts"
import { fetchQueryExport } from '@sinequa/atomic';

const model = {
  export: 'Result' as const,
  format: 'Csv' as const,
  webservice: 'training_export',
  maxcount: 100,
  exportedColumns: ['Title', 'Filename', 'Url'],
  filename: 'results.csv'
};

const response = await fetchQueryExport({
  model,
  appName: 'training',
  query: { name: '_query', text: 'hello world' }
});

// Download the file
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = model.filename ?? 'export.csv';
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
```
