---
title: Selection
---

A store that manages the selection state of articles.

## Basic features

### update()

Updates the state with the provided new state properties.

```typescript
update(newState: Partial<SelectionState>): void
```

| Parameter | Type                    | Description                                      |
|-----------|-------------------------|--------------------------------------------------|
| newState  | Partial\<SelectionState\> | The partial state object containing properties to update. |

### updateQueryText()

Updates the query text in the state.

```typescript
updateQueryText(queryText: string): void
```

| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| queryText | string | The new query text to set. |

### clear()

Clears the state.

```typescript
clear(): void
```
