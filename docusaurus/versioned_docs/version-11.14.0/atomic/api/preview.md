---
title: Preview
sidebar_class_name: update
---

The Preview module provides functions to fetch document preview data and retrieve cached document content. It enables displaying highlighted document previews without opening the full document.

## Functions

### `fetchPreview()`

Fetches preview data for a specific document based on a query. The returned object includes highlight data and the URL of the cached document content.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | `string` | ✓ | The unique document identifier |
| `query` | `Query` | ✓ | The current query (used for highlight computation) |

**Returns** `Promise<PreviewData>` — preview data including cache URL and highlight positions.

```typescript title="PreviewData type"
type PreviewData = {
  record: Article;
  resultId: string;
  cacheId: string;
  highlightsPerCategory: HighlightDataPerCategory;
  highlightsPerLocation: HighlightDataPerLocation[];
  documentCachedContentUrl: string;
};
```

**Example**

```typescript title="fetch-preview.ts"
import { fetchPreview } from '@sinequa/atomic';

const preview = await fetchPreview('doc-id-123', {
  name: '_query',
  text: 'Tesla'
});

console.log(preview.documentCachedContentUrl);
// Load this URL in an <iframe> or fetch the content directly
```

---

### `fetchPreviewUrl()`

Fetches the HTML content of a cached document preview URL.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `url` | `string` | ✓ | The cached document URL (typically from `PreviewData.documentCachedContentUrl`) |

**Returns** `Promise<string>` — the document content as an HTML string.

**Example**

```typescript title="fetch-preview-url.ts"
import { fetchPreview, fetchPreviewUrl } from '@sinequa/atomic';

const { documentCachedContentUrl } = await fetchPreview('doc-id-123', query);
const htmlContent = await fetchPreviewUrl(documentCachedContentUrl);

// Inject into an iframe or display in a shadow DOM
document.getElementById('preview-container')!.innerHTML = htmlContent;
```
