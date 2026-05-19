---
title: isJsonable
---

Checks if the given value can be safely converted to JSON.

| parameter | type | description |
| --- | --- | --- |
| `obj` | `unknown` | The value to check |

__Returns__ `boolean`: True if the value can be safely converted to JSON, false otherwise.

#### Example

```js title="is-jsonable.js"
import { isJsonable } from "@sinequa/atomic";

console.log(isJsonable(null));      // Output: false
console.log(isJsonable(undefined)); // Output: false
console.log(isJsonable(42));        // Output: false
console.log(isJsonable("test"));    // Output: false
console.log(isJsonable([]));        // Output: true
console.log(isJsonable({}));        // Output: true
console.log(isJsonable(new ArrayBuffer(10))); // Output: false
console.log(isJsonable(new Blob())); // Output: false
```
