---
title: isBlob
sidebar_class_name: update
---

Checks whether the given value is a `Blob` instance.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `value` | `unknown` | ✓ | The value to check |

**Returns** `boolean` — `true` if the value is a `Blob`, `false` otherwise.

**Example**

```typescript title="is-blob.ts"
import { isBlob } from '@sinequa/atomic';

console.log(isBlob(null));                  // false
console.log(isBlob(undefined));             // false
console.log(isBlob('test'));                // false
console.log(isBlob(new ArrayBuffer(10)));   // false
console.log(isBlob(new Blob()));            // true
```
