---
title: Saved Searches Service
---

## Overview
The `SavedSearchesService` is used to manage saved searches in the application. It provides methods to get, save, update, and delete saved searches.

### getSavedSearches()

Retrieves the list of saved searches from the user settings store.

```typescript
getSavedSearches(): SavedSearch[]
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `SavedSearch[]`| An array of saved searches.        |

**Usage Example:**

```typescript
const service = new SavedSearchesService();
const searches = service.getSavedSearches();
console.log(searches);
```

### saveSearch()

Saves the current search query to the user's saved searches.

This method retrieves the current search text from the query parameters store.
If the search text is empty, it logs an error and exits.
Otherwise, it creates a new saved search object with the current URL, date, and search text.

The new saved search is added to the beginning of the saved searches array.
If the array exceeds the maximum allowed storage, the oldest search is removed.

Finally, the updated saved searches array is saved back to the user settings store,
and a success message is displayed to the user.

```typescript
saveSearch(): void
```

**Usage Example:**

```typescript
const service = new SavedSearchesService();
service.saveSearch();
```

### updateSavedSearches()

Updates the saved searches in the user settings store.

```typescript
updateSavedSearches(savedSearches: SavedSearch[]): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `savedSearches` | `SavedSearch[]`| An array of SavedSearch objects to update. |

**Usage Example:**

```typescript
const service = new SavedSearchesService();
const searches = [{ url: 'example.com', date: '2023-01-01', display: 'Example Search' }];
service.updateSavedSearches(searches);
```

### deleteSavedSearch()

Deletes a saved search from the user settings store.

```typescript
deleteSavedSearch(index: number): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `index`   | `number`| The index of the saved search to delete. |

**Usage Example:**

```typescript
const service = new SavedSearchesService();
service.deleteSavedSearch(0);
```