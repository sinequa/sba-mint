---
title: isString
sidebar_class_name: deprecated
---

:::warning Deprecated
Use `typeof value === "string"` directly instead.
:::

Checks whether the given value is a string.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `value` | `unknown` | ✓ | The value to check |

**Returns** `boolean` — `true` if the value is a string, `false` otherwise.

**Example**

```typescript title="is-string.ts"
import { isString } from '@sinequa/atomic';

console.log(isString('hello')); // true
console.log(isString(42));      // false

// Preferred alternative:
console.log(typeof 'hello' === 'string'); // true
```
