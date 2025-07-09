---
title: Saved Searches
---

The Saved Searches Service is used to manage saved searches in the application. It provides methods to get, save, update, and delete saved searches.

## Functions

### getSavedSearches()

```typescript
getSavedSearches(): SavedSearch[]
```

#### Returns

| Type           | Description                        |
|----------------|------------------------------------|
| `SavedSearch[]`| An array of saved searches.        |

#### Example

```typescript
const service = new SavedSearchesService();
const searches = service.getSavedSearches();
console.log(searches);
```

### saveSearch()

```typescript
saveSearch(): void
```

#### Example

```typescript
const service = new SavedSearchesService();
service.saveSearch();
```

### updateSavedSearches()

#### Signature

```typescript
updateSavedSearches(savedSearches: SavedSearch[]): void
```

| Parameter       | Type           | Description                        |
|-----------------|----------------|------------------------------------|
| `savedSearches` | `SavedSearch[]`| An array of SavedSearch objects to update. |

#### Example

```typescript
const service = new SavedSearchesService();
const searches = [{ url: 'example.com', date: '2023-01-01', display: 'Example Search' }];
service.updateSavedSearches(searches);
```

### deleteSavedSearch()

```typescript
deleteSavedSearch(index: number): void
```

| Parameter | Type    | Description                          |
|-----------|---------|--------------------------------------|
| `index`   | `number`| The index of the saved search to delete. |

#### Example

```typescript
const service = new SavedSearchesService();
service.deleteSavedSearch(0);
```
