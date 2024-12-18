---
title: Selection Service
---

## Overview
The `SelectionService` is responsible for managing the current article selection and updating the query parameters accordingly.

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

### updateArticleIdInQueryParams()

Updates the article ID in the query parameters of the current route. If the provided ID is undefined, it will remove the ID from the query parameters.

```typescript
private updateArticleIdInQueryParams(id?: string): void
```

| Parameter | Type                | Description                                      |
|-----------|---------------------|--------------------------------------------------|
| `id`      | `string`            | Optional. The article ID to be set in the query parameters. If undefined, the ID will be removed. |

**Usage Example:**
```typescript
selectionService.updateArticleIdInQueryParams('123');
```

### clearArticleIdFromQueryParams()

Clears the 'id' parameter from the current route's query parameters.

```typescript
private clearArticleIdFromQueryParams(): void
```

**Usage Example:**
```typescript
selectionService.clearArticleIdFromQueryParams();
```