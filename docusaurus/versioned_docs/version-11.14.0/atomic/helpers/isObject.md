---
title: isObject
sidebar_class_name: update
---

Checks whether the given value is a non-null object (including arrays).

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `value` | `unknown` | ✓ | The value to check |

**Returns** `boolean` — `true` if the value is an object (and not `null`), `false` otherwise.

**Example**

```typescript title="is-object.ts"
import { isObject } from '@sinequa/atomic';

console.log(isObject(null));      // false
console.log(isObject(undefined)); // false
console.log(isObject(42));        // false
console.log(isObject('test'));    // false
console.log(isObject([]));        // true
console.log(isObject({}));        // true
```
