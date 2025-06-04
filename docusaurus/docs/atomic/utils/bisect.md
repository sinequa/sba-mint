---
title: Bisect Module
---

## Introduction

The bisect module provides a utility function for splitting an array into two separate arrays based on a predicate function. This is useful for partitioning collections of items into distinct groups according to specific criteria.

## Usage

Import the `bisect` function from the module to partition arrays.

```typescript
import { bisect, Bisections } from '@sinequa/atomic';

// Basic usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = bisect(numbers, num => num % 2 === 0);

// result = {
//   true: [2, 4, 6, 8, 10],  // even numbers
//   false: [1, 3, 5, 7, 9]   // odd numbers
// }
```

## API Reference

### Types

#### `Bisections<T>`

This type represents the result of a bisect operation - two arrays split based on a condition.

```typescript
export type Bisections<T> = { true: T[], false: T[] };
```

| Property | Type  | Description |
| -------- | ----- | ----------- |
| `true`   | `T[]` | Array of elements for which the predicate function returned `true` |
| `false`  | `T[]` | Array of elements for which the predicate function returned `false` |

### Functions

#### `bisect<T>(array: T[], predicate: (value: T) => boolean): Bisections<T>`

Bisects an array into two sub-arrays based on a predicate function.

| Parameter   | Type                    | Description |
| ----------- | ----------------------- | ----------- |
| `array`     | `T[]`                   | The array to bisect |
| `predicate` | `(value: T) => boolean` | Function that determines which sub-array each element belongs to |

**Returns:** A `Bisections<T>` object containing two arrays - elements that satisfied the predicate (in the `true` array) and elements that didn't (in the `false` array).

## Examples

### Filtering Objects by Property

```typescript
import { bisect } from '@sinequa/atomic';

// Filter users by age
const users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 18 },
  { id: 4, name: 'Diana', age: 22 }
];

const { true: adults, false: minors } = bisect(users, user => user.age >= 21);

// adults = [
//   { id: 1, name: 'Alice', age: 25 },
//   { id: 2, name: 'Bob', age: 30 },
//   { id: 4, name: 'Diana', age: 22 }
// ]
// 
// minors = [
//   { id: 3, name: 'Charlie', age: 18 }
// ]
```

### Partitioning API Responses

```typescript
import { bisect } from '@sinequa/atomic';

// Separate successful and failed responses
const apiResponses = [
  { id: 101, status: 'success', data: {...} },
  { id: 102, status: 'error', error: 'Not found' },
  { id: 103, status: 'success', data: {...} },
  { id: 104, status: 'error', error: 'Server error' }
];

const { true: successfulResponses, false: failedResponses } = 
  bisect(apiResponses, response => response.status === 'success');

// Process successful responses
successfulResponses.forEach(response => {
  // Handle data from successful responses
});

// Handle errors from failed responses
failedResponses.forEach(response => {
  // Log or handle errors
});
```

### Working with Mixed Data Types

```typescript
import { bisect } from '@sinequa/atomic';

// Separate strings and numbers
const mixedArray = [1, 'hello', 42, 'world', true, false];

const { true: numbers, false: nonNumbers } = 
  bisect(mixedArray, item => typeof item === 'number');

// numbers = [1, 42]
// nonNumbers = ['hello', 'world', true, false]
```

### Combining with Other Array Operations

```typescript
import { bisect } from '@sinequa/atomic';

const data = [10, 20, 30, 40, 50, 60];

// First separate elements above and below a threshold
const { true: aboveThreshold, false: belowThreshold } = 
  bisect(data, value => value > 35);

// Then perform additional operations on each group
const doubledAboveThreshold = aboveThreshold.map(value => value * 2);
const sumBelowThreshold = belowThreshold.reduce((sum, value) => sum + value, 0);

// doubledAboveThreshold = [80, 100, 120]
// sumBelowThreshold = 60
```

## Performance Considerations

The `bisect` function uses JavaScript's `reduce` method to process the array, which means it has a time complexity of O(n) where n is the length of the input array. This is optimal for a single-pass partition operation.

For very large arrays, consider that the function creates two new arrays in memory rather than modifying the original array.
