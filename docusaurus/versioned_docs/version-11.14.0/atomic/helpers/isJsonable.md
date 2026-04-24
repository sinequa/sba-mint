---
title: isJsonable
---

Checks whether the given value can be safely serialized to JSON. Returns `true` for plain objects and arrays, `false` for `null`, primitives, `ArrayBuffer`, `Blob`, and strings.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `obj` | `unknown` | ✓ | The value to check |

**Returns** `boolean` — `true` if the value is JSON-serializable, `false` otherwise.

**Example**

```typescript title="is-jsonable.ts"
import { isJsonable } from '@sinequa/atomic';

console.log(isJsonable(null));                  // false
console.log(isJsonable(42));                    // false
console.log(isJsonable('test'));                // false
console.log(isJsonable(new ArrayBuffer(10)));   // false
console.log(isJsonable(new Blob()));            // false
console.log(isJsonable([]));                    // true
console.log(isJsonable({}));                    // true
```
