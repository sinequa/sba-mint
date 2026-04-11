---
title: escapeExpr
sidebar_class_name: update
---

Escapes a string for safe use in a Sinequa fielded search expression. Backslashes are doubled, backquotes are prefixed with a backslash, and the result is enclosed in backquotes.

:::caution
This function is designed for a specific use case: escaping values for the Sinequa expression parser. Use it only when building fielded search expressions.
:::

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `value` | `string \| undefined` | | The string to escape. Returns ` `` ` if `undefined` or empty. |

**Returns** `string` — the escaped expression string, enclosed in backquotes.

:::tip Escape rules
- `\` → `\\`
- `` ` `` → `` \` ``
- Result is wrapped in `` ` `` ... `` ` ``
:::

**Example**

```typescript title="escape-expr.ts"
import { escapeExpr } from '@sinequa/atomic';

const column = 'source';
const value = 'web/wikipedia/*';
const expr = `${column}:${escapeExpr(value)}`;
// 'source:`web/wikipedia/*`'

console.log(escapeExpr(undefined)); // ``
console.log(escapeExpr(''));        // ``
console.log(escapeExpr('test'));    // `test`
console.log(escapeExpr('a\\b'));    // `a\\b`
console.log(escapeExpr('a`b'));     // `a\`b`
```
