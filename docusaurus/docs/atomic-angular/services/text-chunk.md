---
title: Text Chunk
sidebar_class_name: update
---

The `TextChunkService` retrieves text chunks from the Sinequa backend for a given document and set of highlight locations.

## Methods

### `getTextChunks()`

Fetches text chunks with surrounding context sentences and highlights.

```typescript
getTextChunks(
  id: string,
  textChunks: TextLocation[],
  highlights: string[],
  query: Query,
  leftSentencesCount: number,
  rightSentencesCount: number
): Observable<TextChunk[]>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | The ID of the record. |
| `textChunks` | `TextLocation[]` | ✓ | Text locations within the document. |
| `highlights` | `string[]` | ✓ | Highlight category names to apply. |
| `query` | `Query` | ✓ | The query used to retrieve the chunks. |
| `leftSentencesCount` | `number` | ✓ | Number of sentences to include before each chunk. |
| `rightSentencesCount` | `number` | ✓ | Number of sentences to include after each chunk. |

**Returns** `Observable<TextChunk[]>` — emits the retrieved text chunks.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { TextChunkService } from '@sinequa/atomic-angular';

inject(TextChunkService).getTextChunks(
  'recordId',
  [{ start: 0, end: 100 }],
  ['extractslocations', 'matchlocations'],
  query,
  2,
  2
).subscribe(chunks => {
  console.log(chunks);
});
```
