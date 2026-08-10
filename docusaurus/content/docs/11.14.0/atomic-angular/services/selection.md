---
title: Selection
---

The `SelectionService` manages the current article selection and synchronizes it with the query parameters store.

## Methods

### `setCurrentArticle()`

Sets the currently selected article and optionally updates the query text.

```typescript
setCurrentArticle(article?: Article, withQueryText?: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Article` | | The article to select. If `undefined`, clears the current selection. |
| `withQueryText` | `boolean` | | Whether to update the query text in the selection store. Default: `true`. |

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { SelectionService } from '@sinequa/atomic-angular';

inject(SelectionService).setCurrentArticle({ id: '123', title: 'Sample Article' });
```

### `clearCurrentArticle()`

Clears the current article selection and removes the article ID from query parameters.

```typescript
clearCurrentArticle(): void
```

**Example**

```typescript
inject(SelectionService).clearCurrentArticle();
```
