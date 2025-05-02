---
title: Autocomplete Service
---

## Overview
The `AutocompleteService` provides methods to retrieve autocomplete items for a given text.

### getFromSuggestQueriesForText()

Retrieves autocomplete items for the given text, max count for each category handled by the service can be specified in the admin.

```typescript
getFromSuggestQueriesForText(text: string): Observable<Suggestion[][]>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `text`| `string`         | Text to retrieve autocomplete items for.                   |

**Usage Example:**

```typescript
autocompleteService.getFromSuggestQueriesForText('example text')
  .subscribe(suggestions => {
    console.log(suggestions);
  });
```

### getFromUserSettingsForText()

Retrieves autocomplete items for the given text from the user settings.

```typescript
getFromUserSettingsForText(
  text: string,
  maxCount?: number | Autocomplete
): Observable<Suggestion[][]>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `text`| `string`         | Text to retrieve autocomplete items.                   |
| `maxCount`| `number \| Autocomplete`         | Maximum number of items to retrieve.                   |

**Usage Example:**

```typescript
const suggestions = autocompleteService.getFromUserSettingsForText('example text', 5);
console.log(suggestions);
```