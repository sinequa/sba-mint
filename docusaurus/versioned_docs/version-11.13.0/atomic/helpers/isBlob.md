---
title: isBlob
---

Checks if the given value is a Blob.

| parameter | type | description |
| --- | --- | --- |
| `value` | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is a Blob, false otherwise.

#### Example

```js title="is-blob.js"
import { isBlob } from "@sinequa/atomic";

console.log(isBlob(null));      // Output: false
console.log(isBlob(undefined)); // Output: false
console.log(isBlob(42));        // Output: false
console.log(isBlob("test"));    // Output: false
console.log(isBlob([]));        // Output: false
console.log(isBlob({}));        // Output: false
console.log(isBlob(new ArrayBuffer(10))); // Output: false
console.log(isBlob(new Blob())); // Output: true
```
