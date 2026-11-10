---
title: guid
---

Generates a globally unique identifier (GUID).

| parameter | type | description |
| --- | --- | --- |
| `withHyphens` | `boolean` | Optional. If true, includes hyphens in the GUID. Default is true. |

__Returns__ `string`: A newly generated GUID.

#### Example

```js title="guid-with-hypens.js"
  import { guid } from "@sinequa/atomic";

  console.log(guid());
  // Output: "550e8400-e29b-41d4-a716-446655440000" (example GUID)
```

```js title="guid-without-hyphens.js"
import { guid } from "@sinequa/atomic";

console.log(guid(false));
// Output: "550e8400e29b41d4a716446655440000" (example GUID without hyphens)
```
