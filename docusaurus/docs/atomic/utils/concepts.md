---
title: Concepts
---

## Introduction

This module provides utility functions for parsing, rewriting, and manipulating concepts and patterns in text. It is useful for handling advanced search queries or text processing where concepts are represented using specific patterns (e.g., groups, adjacent, exact, regex, token).

## Types

### FullTextPattern

Represents a parsed pattern from the text.

```typescript
export type FullTextPattern = {
  type: 'group' | 'adjacent' | 'exact' | 'regex' | 'token',
  value: string,
  op?: '+' | '-'
};
```

| Property | Type | Description |
|----------|------|-------------|
| `type`   | `'group' \| 'adjacent' \| 'exact' \| 'regex' \| 'token'` | The type of pattern |
| `value`  | `string` | The value/content of the pattern |
| `op`     | `'+' \| '-'` | Optional operator (e.g., required or excluded) |

## Functions

### parseText

```typescript
function parseText(text: string): FullTextPattern[]
```

Parses the given text and returns an array of `FullTextPattern` objects.

```typescript
function parseText(text: string): FullTextPattern[]
```

#### Example

```typescript
parseText('+(foo) -[bar] "baz" /qux/ token');
// Output: [
//   { type: 'group', value: 'foo', op: '+' },
//   { type: 'adjacent', value: 'bar', op: '-' },
//   { type: 'exact', value: 'baz' },
//   { type: 'regex', value: 'qux' },
//   { type: 'token', value: 'token' }
// ]
```

### rewriteText

Rewrites the text based on an array of `FullTextPattern` objects.

```typescript
function rewriteText(patterns: FullTextPattern[]): string
```

### addConcepts

Adds concepts to the given text by modifying the patterns.

```typescript
function addConcepts(text: string, concepts: string[], op?: '+'|'-'): string
```

### removeConcept

Removes a single concept from the given text.

```typescript
function removeConcept(concept: string, text: string): string
```

### removeConcepts

Removes all concepts (adjacent patterns) from the given text.

```typescript
function removeConcepts(text: string): string
```

### getConcepts

Retrieves all concepts (adjacent patterns) from the given text.

```typescript
function getConcepts(text: string): string[]
```

#### Example

```typescript
getConcepts('This is a +[test] +[sentence].');
// Output: ["test", "sentence"]
```

## Notes

- Concepts are typically represented as `+[concept]` in the text (adjacent group with a plus operator).
- The utilities are designed to work with advanced search or query syntax.
