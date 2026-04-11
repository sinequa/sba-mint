---
title: Autocomplete
sidebar_class_name: update
---

The `AutocompleteService` provides methods to retrieve autocomplete suggestions for a given text, sourced from suggest queries or user settings.

## Methods

### `getFromSuggestQueriesForText()`

Retrieves autocomplete suggestions from the suggest queries configured in the Sinequa administration.

```typescript
getFromSuggestQueriesForText(text: string): Observable<Suggestion[][]>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `text` | `string` | ✓ | Text to retrieve suggestions for. |

**Returns** `Observable<Suggestion[][]>` — emits arrays of suggestions grouped by suggest query.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AutocompleteService } from '@sinequa/atomic-angular';

inject(AutocompleteService).getFromSuggestQueriesForText('example').subscribe(suggestions => {
  console.log(suggestions);
});
```

### `getFromUserSettingsForText()`

Retrieves autocomplete suggestions from user settings (recent searches, saved searches, bookmarks).

```typescript
getFromUserSettingsForText(text: string, maxCount: number | Autocomplete): Suggestion[]
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `text` | `string` | ✓ | Text to retrieve suggestions for. |
| `maxCount` | `number \| Autocomplete` | ✓ | Maximum number of items to retrieve. |

**Returns** `Suggestion[]` — array of suggestions from user settings, grouped by `recent-searches`, `saved-searches`, and `bookmarks`.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AutocompleteService } from '@sinequa/atomic-angular';

const suggestions = inject(AutocompleteService).getFromUserSettingsForText('example', 5);
console.log(suggestions);
```
