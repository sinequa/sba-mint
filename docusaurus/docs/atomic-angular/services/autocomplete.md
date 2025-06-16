---
title: Autocomplete Service
---

## Overview

The Autocomplete Service provides methods to retrieve autocomplete items for a given text.

### `getFromSuggestQueriesForText`

Retrieves autocomplete items for the given text, max count for each category handled by the service can be specified in the admin.

#### Parameters
| Parameter | Type     | Description                                                                 |
|-----------|----------|-----------------------------------------------------------------------------|
| `text`    | `string` | Text to retrieve autocomplete items for                                      |

#### Returns
`Observable<Suggestion[][]>`: An observable of an array of `Suggestion` arrays grouped by suggestion queries configured in the admin.

#### Example
```typescript
autocompleteService.getFromSuggestQueriesForText('example text').subscribe(suggestions => {
  console.log(suggestions);
});
```

### `getFromUserSettingsForText`

Retrieves autocomplete items for the given text from the user settings.


#### Parameters
| Parameter | Type                         | Description                                                                 |
|-----------|------------------------------|-----------------------------------------------------------------------------|
| `text`    | `string`                     | Text to retrieve autocomplete items for                                      |
| `maxCount`| `number \| Autocomplete`     | Maximum number of items to retrieve                                          |

#### Returns
`Suggestion[]`: An array of `Suggestion` arrays grouped by `recent-searches`, `saved-searches`, `bookmarks` from the user settings.

#### Example
```typescript
const suggestions = autocompleteService.getFromUserSettingsForText('example text', 5);
console.log(suggestions);
```