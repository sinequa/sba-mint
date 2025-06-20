---
title: isArrayBuffer
---

Checks if the given value is an ArrayBuffer.

| parameter | type | description |
| --- | --- | --- |
| `value` | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is an ArrayBuffer, false otherwise.

#### Example

```js title="is-array-buffer.js"
import { isArrayBuffer } from "@sinequa/atomic";

console.log(isArrayBuffer(null));      // Output: false
console.log(isArrayBuffer(undefined)); // Output: false
console.log(isArrayBuffer(42));        // Output: false
console.log(isArrayBuffer("test"));    // Output: false
console.log(isArrayBuffer([]));        // Output: false
console.log(isArrayBuffer({}));        // Output: false
console.log(isArrayBuffer(new ArrayBuffer(10))); // Output: true
```
