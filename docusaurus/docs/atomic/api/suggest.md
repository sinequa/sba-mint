---
title: Suggestions
---

## Overview
This module provides functionality for retrieving and managing suggestions based on user input. It allows users to:

- Fetch suggestions for given text input
- Apply filters to refine suggestion results
- Specify types of suggestions to include
- Optionally retrieve the source of each suggestion

These operations enable efficient autocomplete functionality, enhancing user experience in search and input scenarios.


### fetchSuggest()
Fetches suggestions based on the provided parameters.

| Parameter | Type | Description |
| --- | --- | --- |
| suggestQueryName | `string` | The name of the suggest query to use. |
| text | `string` | The text to get suggestions for. |
| filter | `Record<string, unknown>` | Optional. A filter to apply to the suggestions.<br/><br/>Contains a list of columns (key\/value pairs) to filter.<br/>The columns used within this parameter must be declared in the Filter columns section options of the suggestion lexicon.<br/>_example: \{ "columns": \{"docformat": "\*", "authors": "\*"\}, \{ "filter": \{ "docformat": "doc"\}\}\}_ |
| kinds | `string[]` | Optional. An array of suggestion kinds to include.<br/><br/>Allows overriding the types defined in the suggestion query that are used by default. <br/>To specify several kinds, use the comma as a separator.<br/>By default, all kinds defined in the suggestion lexicon are taken into account.<br/>_example "kinds": ["city", "name"]_ |
| showSources | `boolean` | Optional. When set to true, returns the name of the index column from which the suggested term is extracted |

__Returns__ A promise that resolves to an array of Suggestion objects.

```js title="Suggestion Type"
export interface Suggestion {
    category: string;
    display: string;
    frequency?: string;
    id?: string;
    normalized?: string;
}
```

#### Example

```js title="example-fetch-suggest.js"
import { fetchSuggest } from "@sinequa/atomic";

// the name of the suggest query to use can be found in autocomplete webservice 
// defined in the Admin panel of Sinequa.
// Here, the suggest query name is `su-sba-suggest-query`
const suggestions = await fetchSuggest("su-sba-suggest-query", "tes");
console.log("suggestions", suggestions);
```
:::tip
You can retrieve the CCApp object using the [fetchApp()](app/#fetchapp) function to dynamically find the
suggest query associated to your autocomplete webservice.
:::

```json title="extract from the CCApp object"
{ 
  "webServices": {
    "training_autocomplete": {
        "description": "default web service for auto-complete",
        "webServiceType": "Autocomplete",
        "revision": 2,
        "enabled": true,
        "suggestQueries": "su-sba-suggest-query",
        "inputLengthTrigger": "",
        "groupSuggestionsByCategory": true,
        "useFieldedSearch": true,
        "uncollapsedItemsPerCategory": "",
        "name": "training_autocomplete"
    },
    ...
  }
}
```

### fetchSuggestField()
Fetches suggestions for a specific field.

| Parameter | Type | Description |
| --- | --- | --- |
| text | `string` | The text to get suggestions for. |
| fields | `string[]` | An array of field names to fetch suggestions from.<br/>This parameter is required if you set `action` to **suggests** |

:::info
Today the `action` default value is **suggests** and cannot be modified. So `fields` parameter is mandatory.
:::

__Returns__ A promise that resolves to an array of Suggestion objects.

#### Example
```js title="example-fetch-suggest-field.js"
import { fetchSuggestField } from "@sinequa/atomic";

const suggestions = await fetchSuggestField("tesla", "['doctype', 'docformat']");
console.log("suggestions", suggestions);
```

### fetchSuggestQuery()
Fetches suggestions based on the provided query parameters.
:::danger
This function is deprecated. Use [fetchSuggest](#fetchsuggestsuggestqueryname-text-filter-kinds-showsources) instead.  
This function exists for legacy reasons and could be removed in the futur.
:::


| Parameter | Type | Description |
| --- | --- | --- |
| suggestQueryName | `string` | The name of the suggest query to use. |
| text | `string` | The text to get suggestions for. |
| queryName | `string` | The name of the query to use for fetching suggestions. |
| fields | `string` \| `string[]` | Optional array of kinds to filter the suggestions.<br/><br/>Allows overriding the types defined in the suggestion query that are used by default.<br/>To specify several kinds, use the comma as a separator.<br/>By default, all kinds defined in the suggestion lexicon are taken into account.<br/>_example "kinds": ["city", "name"]_ |

__Returns__ A promise that resolves to an array of Suggestion objects.

#### Example

```js title="example-fetch-suggest.js"
import { fetchSuggestQuery } from "@sinequa/atomic";

// the name of the suggest query to use can be found in autocomplete webservice 
// defined in the Admin panel of Sinequa.
// Here, the suggest query name is `su-sba-suggest-query`
const suggestions = await fetchSuggestQuery("su-sba-suggest-query", "tes");
console.log("suggestions", suggestions);
```