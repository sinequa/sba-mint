---
title: escapeExpr
---

Escape a string so that the characters in it are not processed by the fielded search expression parser.
Single occurrences of the backslash character are replaced by two backslashes and backquote characters
are prefixed by a backslash. Finally, the string is enclosed in backquotes.

| parameter | type | description |
|---|---|---|
| `value` | `string` | The string to escape (optional) |

:::tip examples

```text
`` a\`\b `` => `` a\\\`\\b ``
\ => \\  
` => \`  
```

:::

:::caution
This function has very specific use cases.
:::

#### Example

```js title="escapeExpr.js"
import { escapeExpr } from "@sinequa/atomic";

const value = "web/wikipedia/*";
const column = "source";
const expr = `${column}: ${escapeExpr(value)}`;
console.log(expr); // Output: "source: `web/wikipedia/*`

console.log(escapeExpr(undefined)); // Output: ``
console.log(escapeExpr(""));        // Output: ``
console.log(escapeExpr("test"));    // Output: `test`
console.log(escapeExpr("a\\b"));    // Output: `a\\\\b`
console.log(escapeExpr("a`b"));     // Output: `a\\`b`
console.log(escapeExpr("a\\`b"));   // Output: `a\\\\\\`b`
```
