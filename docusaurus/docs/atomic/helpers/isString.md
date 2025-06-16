---
title: isString
---

Checks if the given value is a string.

| parameter | type | description |
| --- | --- | --- |
| `value` | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is a string, false otherwise.

#### Example

```js title="is-string.js"
import { isString } from "@sinequa/atomic";

console.log(isString(null));      // Output: false
console.log(isString(undefined)); // Output: false
console.log(isString(42));        // Output: false
console.log(isString("test"));    // Output: true
console.log(isString([]));        // Output: false
console.log(isString({}));        // Output: false
```
