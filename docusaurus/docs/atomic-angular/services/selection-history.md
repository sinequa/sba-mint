---
title: Selection History Service
---
## Overview

The `SelectionHistoryService` class is responsible for managing the selection history. It keeps track of the history of selected articles and provides methods to navigate through the history. The service also emits events when the selection history changes. This service is used by the Drawer.

### getCurrentSelectionIndex()

Retrieves the index of the current selection.

```typescript
public getCurrentSelectionIndex(): number
```

**Returns:**
- `number`: The index of the current selection, which is the last element in the history array.

**Usage Example:**
```typescript
const currentIndex = selectionHistoryService.getCurrentSelectionIndex();
console.log(currentIndex);
```

### getSelection()

Retrieves an article from the selection history at the specified index.

```typescript
public getSelection(index: number): Article | undefined
```

| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| `index`   | number | The index of the article to retrieve.            |

**Returns:**
- `Article | undefined`: The article at the specified index, or `undefined` if the index is out of bounds.

**Usage Example:**
```typescript
const article = selectionHistoryService.getSelection(0);
console.log(article);
```

### getHistoryLength()

Retrieves the length of the history array.

```typescript
public getHistoryLength(): number
```

**Returns:**
- `number`: The number of entries in the history.

**Usage Example:**
```typescript
const historyLength = selectionHistoryService.getHistoryLength();
console.log(historyLength);
```

### clearHistory()

Clears the selection history and resets the current article selection.

```typescript
public clearHistory(): void
```

**Usage Example:**
```typescript
selectionHistoryService.clearHistory();
```

### back()

Navigates back in the selection history.

```typescript
public back(): Article | undefined
```

**Returns:**
- `Article | undefined`: The last article in the history, or `undefined` if the history is empty.

**Usage Example:**
```typescript
const previousArticle = selectionHistoryService.back();
console.log(previousArticle);
```