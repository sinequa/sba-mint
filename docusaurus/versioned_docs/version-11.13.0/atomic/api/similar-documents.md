---
title: Fetch Similar Documents
---

This module provides functionality for retrieving documents that are similar to a given document. It allows users to:

- Fetch similar documents based on a specified document ID and query name

These operations enable efficient retrieval of related documents, enhancing user experience in search and discovery scenarios.

## Functions

### fetchSimilarDocuments()

Fetches similar documents based on the provided document ID and query name.

| Parameter | Type | Description |
| --- | --- | --- |
| `documentId` | `string` | The ID of the document to compare against. |
| `queryName` | `string` | The name of the query to use for comparison. |

__Returns__ A promise that resolves to an object containing an array of `Article` objects and a `methodresult` string.

#### Example

```typescript
import { fetchSimilarDocuments } from '@sinequa/atomic';

// Example 1: Fetch similar documents using a document ID and query name
async function exampleFetchSimilarDocuments() {
  try {
    const documentId = '12345';
    const queryName = 'similarityQuery';
    const result = await fetchSimilarDocuments(documentId, queryName);
    console.log('Similar Documents:', result.data);
    console.log('Method Result:', result.methodresult);
  } catch (error) {
    console.error('Error fetching similar documents:', error);
  }
}

exampleFetchSimilarDocuments();
```
