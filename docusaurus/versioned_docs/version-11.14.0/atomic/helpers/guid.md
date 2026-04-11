---
title: guid
sidebar_class_name: update
---

Generates a pseudo-GUID string using `Math.random`.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `withHyphens` | `boolean` | | Include hyphens in the output. Default: `true` |

**Returns** `string` — a newly generated GUID.

**Example**

```typescript title="guid.ts"
import { guid } from '@sinequa/atomic';

console.log(guid());       // '550e8400-e29b-41d4-a716-446655440000'
console.log(guid(false));  // '550e8400e29b41d4a716446655440000'
```
