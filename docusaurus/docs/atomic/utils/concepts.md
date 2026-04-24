---
title: Concepts
---

This module provides utility functions for parsing, rewriting, and manipulating search concepts in text. Concepts are represented using a pattern syntax (groups, adjacent, exact, regex, token) and are commonly used in advanced search query building.

## Types

### `FullTextPattern`

Represents a single parsed pattern from a text string.

```typescript
type FullTextPattern = {
  type: 'group' | 'adjacent' | 'exact' | 'regex' | 'token';
  value: string;
  op?: '+' | '-';
};
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | The pattern type |
| `value` | `string` | The content of the pattern |
| `op` | `'+' \| '-'` | Optional operator: `+` (required) or `-` (excluded) |

## Functions

### `parseText()`

Parses a text string into an array of `FullTextPattern` objects.

```typescript
function parseText(text: string): FullTextPattern[]
```

**Example**

```typescript
import { parseText } from '@sinequa/atomic';

parseText('+(foo) -[bar] "baz" /qux/ token');
// [
//   { type: 'group',    value: 'foo',   op: '+' },
//   { type: 'adjacent', value: 'bar',   op: '-' },
//   { type: 'exact',    value: 'baz' },
//   { type: 'regex',    value: 'qux' },
//   { type: 'token',    value: 'token' }
// ]
```

---

### `rewriteText()`

Serializes an array of `FullTextPattern` objects back into a text string.

```typescript
function rewriteText(patterns: FullTextPattern[]): string
```

---

### `getConcepts()`

Extracts all adjacent pattern values (concepts) from a text string.

```typescript
function getConcepts(text: string): string[]
```

**Example**

```typescript
import { getConcepts } from '@sinequa/atomic';

getConcepts('This is a +[test] +[sentence].');
// ['test', 'sentence']
```

---

### `addConcepts()`

Adds one or more concepts to a text string.

```typescript
function addConcepts(text: string, concepts: string[], op?: '+' | '-'): string
```

---

### `removeConcept()`

Removes a single concept from a text string.

```typescript
function removeConcept(concept: string, text: string): string
```

---

### `removeConcepts()`

Removes all adjacent pattern concepts from a text string.

```typescript
function removeConcepts(text: string): string
```

:::note
Concepts are represented as `+[concept]` in query text (adjacent group with a `+` operator).
:::
