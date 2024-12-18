---
title: Selection
---

## Overview

A store that manages the selection state of articles.

## Basic features
### update()

Updates the state with the provided article and optional query text.

```typescript
update(article: Article, queryText?: string): void
```
| Parameter | Type    | Description                          |
|-----------|---------|--------------------------------------|
| article   | Article | The article to set as the selection. |
| queryText | string  | Optional. The query text to set.               |


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

