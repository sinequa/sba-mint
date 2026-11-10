---
title: Similar Documents
---

The Similar Documents module provides a function to find documents related to a given document. This enables "more like this" features in search applications.

## Functions

### `fetchSimilarDocuments()`

Fetches documents that are similar to the specified document, using the given query configuration.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `documentId` | `string` | ✓ | The ID of the reference document |
| `queryName` | `string` | ✓ | The name of the similarity query configured on the server |
| `signal` | `AbortSignal` | | An `AbortSignal` to cancel the request |

**Returns** `Promise<Article[]>` — array of similar document records.

**Example**

```typescript title="fetch-similar-documents.ts"
import { fetchSimilarDocuments } from '@sinequa/atomic';

const similarDocs = await fetchSimilarDocuments('doc-id-123', '_query');
similarDocs.forEach(doc => console.log(doc.title));
```

**Example with cancellation**

```typescript title="fetch-similar-documents-cancel.ts"
import { fetchSimilarDocuments } from '@sinequa/atomic';

const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const docs = await fetchSimilarDocuments('doc-id-123', '_query', controller.signal);
  console.log(docs);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}
```
