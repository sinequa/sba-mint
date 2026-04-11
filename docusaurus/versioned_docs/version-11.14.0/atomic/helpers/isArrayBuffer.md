---
title: isArrayBuffer
sidebar_class_name: update
---

Checks whether the given value is an `ArrayBuffer` instance.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `value` | `unknown` | ✓ | The value to check |

**Returns** `boolean` — `true` if the value is an `ArrayBuffer`, `false` otherwise.

**Example**

```typescript title="is-array-buffer.ts"
import { isArrayBuffer } from '@sinequa/atomic';

console.log(isArrayBuffer(null));                  // false
console.log(isArrayBuffer('test'));                // false
console.log(isArrayBuffer([]));                    // false
console.log(isArrayBuffer({}));                    // false
console.log(isArrayBuffer(new Blob()));            // false
console.log(isArrayBuffer(new ArrayBuffer(10)));   // true
```
