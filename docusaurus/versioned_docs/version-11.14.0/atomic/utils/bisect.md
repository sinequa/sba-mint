---
title: Bisect
sidebar_class_name: update
---

Splits an array into two sub-arrays based on a predicate function. A single O(n) pass partitions elements into those that satisfy the predicate (`true`) and those that do not (`false`).

## Types

### `Bisections<T>`

```typescript
type Bisections<T> = { true: T[]; false: T[] };
```

| Property | Type | Description |
|----------|------|-------------|
| `true` | `T[]` | Elements for which the predicate returned `true` |
| `false` | `T[]` | Elements for which the predicate returned `false` |

## Functions

### `bisect()`

```typescript
function bisect<T>(array: T[], predicate: (value: T) => boolean): Bisections<T>
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `array` | `T[]` | ✓ | The array to partition |
| `predicate` | `(value: T) => boolean` | ✓ | Function that determines which sub-array each element belongs to |

**Returns** `Bisections<T>` — an object with two arrays: `true` (matched) and `false` (unmatched).

**Example**

```typescript title="bisect.ts"
import { bisect } from '@sinequa/atomic';

// Split numbers into even and odd
const { true: evens, false: odds } = bisect([1, 2, 3, 4, 5], n => n % 2 === 0);
// evens: [2, 4]
// odds:  [1, 3, 5]

// Separate active from inactive users
const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob',   active: false },
  { id: 3, name: 'Carol', active: true },
];

const { true: active, false: inactive } = bisect(users, u => u.active);
// active:   [Alice, Carol]
// inactive: [Bob]
```
