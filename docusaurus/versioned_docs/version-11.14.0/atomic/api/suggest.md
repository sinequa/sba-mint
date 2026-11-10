---
title: Suggest
sidebar_class_name: new
---

The Suggest module provides functions to retrieve search suggestions from the backend, based on user input text. It supports suggestion queries, field-based suggestions, and filtering by kind.

## Functions

### `fetchSuggest()`

Fetches suggestions from a named suggest query based on the provided text.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `suggestQueryName` | `string` | ✓ | Name of the suggest query configured on the server |
| `text` | `string` | ✓ | The text for which to fetch suggestions |
| `filter` | `Record<string, unknown>` | | Optional filter object. Keys are column names declared in the suggestion lexicon's filter columns section. |
| `kinds` | `string[]` | | Optional array of suggestion kinds to restrict results. Overrides the kinds defined in the suggest query. |
| `showSource` | `boolean` | | If `true`, includes the source index column name in each suggestion |

**Returns** `Promise<Suggestion[]>` — array of suggestions.

**Example**

```typescript title="fetch-suggest.ts"
import { fetchSuggest } from '@sinequa/atomic';

// Basic suggestion
const suggestions = await fetchSuggest('_suggest', 'sinequa');

// With kind filter
const peopleSuggestions = await fetchSuggest('_suggest', 'john', undefined, ['person']);

// With column filter
const filteredSuggestions = await fetchSuggest('_suggest', 'report', {
  docformat: 'doc'
}, ['city', 'name']);
```

---

### `fetchSuggestField()`

Fetches suggestions for specific index fields based on the provided text.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `text` | `string` | ✓ | The text for which to fetch field suggestions |
| `fields` | `string[]` | ✓ | List of index field names to suggest from |
| `query` | `Query` | | Optional query context to refine suggestions |

**Returns** `Promise<Suggestion[]>` — array of field-based suggestions.

**Example**

```typescript title="fetch-suggest-field.ts"
import { fetchSuggestField } from '@sinequa/atomic';

const suggestions = await fetchSuggestField('tesla', ['title', 'authors']);
suggestions.forEach(s => console.log(s.display));
```

---

### `fetchSuggestQuery()`

:::warning Deprecated
Use [`fetchSuggest()`](#fetchsuggest) instead.
:::

Fetches suggestions based on a query name and optional field kinds.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `suggestQueryName` | `string` | ✓ | Name of the suggest query |
| `text` | `string` | ✓ | The text for which to fetch suggestions |
| `queryName` | `string` | ✓ | The name of the associated query |
| `fields` | `string \| string[]` | | Optional array or comma-separated list of kinds to filter suggestions |

**Returns** `Promise<Suggestion[]>` — array of suggestions.
