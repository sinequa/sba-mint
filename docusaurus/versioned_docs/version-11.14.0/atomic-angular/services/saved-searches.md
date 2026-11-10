---
title: Saved Searches
---

The `SavedSearchesService` manages saved searches: retrieving, saving, updating, and deleting them.

## Methods

### `getSavedSearches()`

Returns all saved searches.

```typescript
getSavedSearches(): SavedSearch[]
```

**Returns** `SavedSearch[]` — the current list of saved searches.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { SavedSearchesService } from '@sinequa/atomic-angular';

const searches = inject(SavedSearchesService).getSavedSearches();
```

### `saveSearch()`

Saves the current search query.

```typescript
saveSearch(): void
```

**Example**

```typescript
inject(SavedSearchesService).saveSearch();
```

### `updateSavedSearches()`

Replaces the saved searches list with the provided array.

```typescript
updateSavedSearches(savedSearches: SavedSearch[]): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `savedSearches` | `SavedSearch[]` | ✓ | The new saved searches list. |

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { SavedSearchesService } from '@sinequa/atomic-angular';

inject(SavedSearchesService).updateSavedSearches([
  { url: 'example.com', date: '2024-01-01', display: 'Example Search' }
]);
```

### `deleteSavedSearch()`

Deletes the saved search at the given index.

```typescript
deleteSavedSearch(index: number): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `index` | `number` | ✓ | The index of the saved search to delete. |

**Example**

```typescript
inject(SavedSearchesService).deleteSavedSearch(0);
```
