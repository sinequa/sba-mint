---
title: Selection History
sidebar_class_name: update
---

The `SelectionHistoryService` maintains a navigable history of selected articles. It is used internally by the `DrawerComponent`.

## Methods

### `getCurrentSelectionIndex()`

Returns the index of the current (most recent) selection in the history.

```typescript
getCurrentSelectionIndex(): number
```

**Returns** `number` — the index of the current selection.

**Example**

```typescript
import { inject } from '@angular/core';
import { SelectionHistoryService } from '@sinequa/atomic-angular';

const index = inject(SelectionHistoryService).getCurrentSelectionIndex();
```

### `getSelection()`

Retrieves an article from the history at the specified index.

```typescript
getSelection(index: number): Article | undefined
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `index` | `number` | ✓ | The index of the article to retrieve. |

**Returns** `Article | undefined` — the article at that index, or `undefined` if out of bounds.

**Example**

```typescript
const article = inject(SelectionHistoryService).getSelection(0);
```

### `getHistoryLength()`

Returns the number of entries in the history.

```typescript
getHistoryLength(): number
```

**Returns** `number` — the history length.

**Example**

```typescript
const length = inject(SelectionHistoryService).getHistoryLength();
```

### `clearHistory()`

Clears the selection history and resets the current article selection.

```typescript
clearHistory(): void
```

**Example**

```typescript
inject(SelectionHistoryService).clearHistory();
```

### `back()`

Navigates back in the selection history.

```typescript
back(): Article | undefined
```

**Returns** `Article | undefined` — the previous article, or `undefined` if the history is empty.

**Example**

```typescript
const previous = inject(SelectionHistoryService).back();
```
