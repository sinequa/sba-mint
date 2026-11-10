---
title: resolveToColumnName
---

Resolves an alias to a column name from a query or indexes schema

| parameter | type | description |
| --- | --- | --- |
| `alias` | `string` | The alias of the column to resolve |
| `app` | `CCApp` | The application state object |
| `queryName` | `string` | Optional. The name of the query to use for resolution |

#### Example

```js title="resolve-to-column-name.js"
import { resolveToColumnName } from "@sinequa/atomic";

const alias = 'recordType';
const appObject = { /* ... */ }; // Assuming this is your CCApp object
const queryName = 'main_query';

const resolved = resolveToColumnName(alias, appObject, queryName);
console.log(resolved); // Output: 'sourcestr1'
```
