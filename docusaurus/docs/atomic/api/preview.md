---
title: Preview
---

## Overview
This module provides functionality for retrieving and displaying document previews. It allows users to:

- Fetch preview data for specific documents based on queries
- Retrieve cached document content URLs
- Access highlighted text segments within previews
- Obtain full document content from cached URLs

These operations enable efficient document preview functionality, enhancing the user's ability to quickly assess document relevance and content without opening the full document.


### fetchPreview()
Fetches preview data for a given id and query.

__Returns__ A promise that resolves to the PreviewData.


| Parameter | Type | Description |
| --- | --- | --- |
| id | `string` | The unique identifier of the document to fetch preview data for. |
| query | `Query` | The query object used to retrieve the preview data. |



```js title="PreviewData Type"
export type PreviewData = {
    record: Article,
    resultId: string,
    cacheId: string,
    highlightsPerCategory: HighlightDataPerCategory,
    highlightsPerLocation: HighlightDataPerLocation[],
    documentCachedContentUrl: string
}
```

#### Example
```js title="example-fetch-preview.js"
import { fetchPreview } from "@sinequa/atomic";

const query = {
  name,
  "text": "Tesla"
};

const response = await fetchPreview(id, query)
const { documentCachedContentUrl } = response;
console.log("document cache content url", documentCachedContentUrl);
```


### fetchPreviewUrl()
Fetches preview document content from a given URL.

| Parameter | Type | Description |
| --- | --- | --- |
| url | `string` | The URL from which to fetch the preview document content. |

__Returns__ A promise that resolves to the preview document content as a string.

#### Example
```js title="example-fetch-preview-url.js"
import { fetchPreviewUrl } from "@sinequa/atomic";

const content = await fetchPreviewUrl("https://my-website.com/index.html");
console.log("content", content); // Output: the document content
```
