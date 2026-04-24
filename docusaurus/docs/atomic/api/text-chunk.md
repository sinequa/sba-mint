---
title: Text Chunks
---

The Text Chunks module provides a function to extract specific text segments from documents, with optional highlighting. This is useful for rendering relevant extracts, entity highlights, or contextual sentences around a match.

:::info
Offset and length values used in `textChunks` come from the document's `Record` object returned after a search (e.g., from `extractslocations`, `matchlocations`, or entity fields).
:::

## Functions

### `fetchTextChunks()`

Fetches text chunks for a given document at the specified locations, with optional context sentences.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | `string` | ✓ | The document's unique identifier |
| `textChunks` | `TextLocation[]` | ✓ | Array of `{ offset, length }` locations to extract |
| `highlights` | `string[]` | ✓ | Array of highlight category names to apply (e.g. `'extractslocations'`, `'person'`) |
| `query` | `Query` | ✓ | The current query context |
| `leftSentencesCount` | `number` | ✓ | Number of context sentences to include before each chunk |
| `rightSentencesCount` | `number` | ✓ | Number of context sentences to include after each chunk |

**Returns** `Promise<{ chunks: TextChunk[] }>` — object containing the array of extracted text chunks.

**Example**

```typescript title="fetch-text-chunks.ts"
import { fetchTextChunks } from '@sinequa/atomic';

const response = await fetchTextChunks(
  'record-id-123',
  [
    { offset: 14937, length: 147 }, // extract location
    { offset: 1069, length: 4 },   // entity chunk
    { offset: 1188, length: 13 },  // person chunk
  ],
  ['extractslocations', 'matchlocations', 'person', 'geo'],
  { name: '_query', text: 'tesla' },
  1,  // 1 sentence before each chunk
  3   // 3 sentences after each chunk
);

response.chunks.forEach(chunk => console.log(chunk.text));
```
