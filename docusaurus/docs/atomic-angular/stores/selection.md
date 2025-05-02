---
title: Selection
---

## Overview

A store that manages the selection state of articles.

## Basic features
### update()

Updates the state with the provided new state's properties.

```typescript
update(newState: Partial<SelectionState>): void
```
| Parameter | Type    | Description                          |
|-----------|---------|--------------------------------------|
| newState   | Partial<SelectionState> | New state object containing only the properties to update.               |

### clear()

Clears the state.

```typescript
clear(): void
```

