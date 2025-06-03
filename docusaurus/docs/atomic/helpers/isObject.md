---
title: isObject
---

Checks if the given value is an object.

| parameter | type | description |
| --- | --- | --- |
| obj | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is an object, false otherwise.

## Example

```js title="is-object.js"
import { isObject } from "@sinequa/atomic";

console.log(isObject(null));      // Output: false
console.log(isObject(undefined)); // Output: false
console.log(isObject(42));        // Output: false
console.log(isObject("test"));    // Output: false
console.log(isObject([]));        // Output: true
console.log(isObject({}));        // Output: true
```
