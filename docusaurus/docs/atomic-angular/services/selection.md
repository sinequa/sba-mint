---
title: Selection
---

The `SelectionService` is responsible for managing the current article selection and updating the query parameters accordingly.

## Functions

### setCurrentArticle()

Sets the current article in the selection store and optionally updates the query text. If the provided article is undefined, it clears the current article.

```typescript
public setCurrentArticle(article?: Article, withQueryText: boolean = true): void
```

| Parameter      | Type                | Description                                                                 |
|----------------|---------------------|-----------------------------------------------------------------------------|
| `article`      | `Article`           | Optional. The article to set as the current article. If undefined, the current article is cleared. |
| `withQueryText`| `boolean`           | A boolean indicating whether to update the query text in the selection store. Defaults to true. |

**Usage Example:**

```typescript
const article: Article = { id: '123', title: 'Sample Article' };
selectionService.setCurrentArticle(article);
```

### clearCurrentArticle()

Clears the current article selection from the selection store and removes the article ID from the query parameters.

```typescript
public clearCurrentArticle(): void
```

**Usage Example:**

```typescript
selectionService.clearCurrentArticle();
```
