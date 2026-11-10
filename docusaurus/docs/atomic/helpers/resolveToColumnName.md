---
title: resolveToColumnName
---

Resolves a column alias to its actual column name using the application's query configuration or index schema.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `alias` | `string` | ✓ | The alias to resolve |
| `app` | `CCApp` | ✓ | The application configuration object |
| `queryName` | `string` | | The name of the query to use for resolution |

**Returns** `string` — the resolved column name, or the original alias if no match is found.

**Example**

```typescript title="resolve-to-column-name.ts"
import { resolveToColumnName } from '@sinequa/atomic';

const columnName = resolveToColumnName('recordType', app, 'main_query');
console.log(columnName); // e.g. 'sourcestr1'
```
