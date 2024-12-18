---
title: Text Chunk Service
---

## Overview
The `TextChunkService` is responsible for retrieving text chunks from the backend based on various parameters.

### getTextChunks()

Retrieves text chunks based on the provided parameters.

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

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `id`                 | `string`         | The ID of the record.                                                       |
| `textChunks`         | `TextLocation[]` | An array of `TextLocation` objects representing the location of the text chunks. |
| `highlights`         | `string[]`       | An array of strings representing the highlights to be applied to the text chunks. |
| `query`              | `Query`          | The query used to retrieve the text chunks.                                 |
| `leftSentencesCount` | `number`         | The number of sentences to include before the text chunks.                  |
| `rightSentencesCount`| `number`         | The number of sentences to include after the text chunks.                   |

**Usage Example:**

```typescript
textChunkService.getTextChunks(
  'recordId',
  [{ start: 0, end: 100 }],
  ['highlight1', 'highlight2'],
  query,
  2,
  2
).subscribe(chunks => {
  console.log(chunks);
});
```