---
title: Text Chunks
---

## Overview
This module provides functionality for working with text chunks in documents. It allows users to:

- Retrieve specific portions of text from documents
- Apply highlights to selected text segments
- Fetch contextual sentences surrounding the main text chunks

These operations enable efficient text analysis, extraction, and presentation of relevant document content.


### fetchTextChunks()

Fetches text chunks for a given document based on the provided parameters.

| Parameter | Type | Description |
| --- | --- | --- |
| id | `string` | The unique identifier of the document. |
| textChunks | `TextLocations[]` | An array of text chunks to fetch. |
| highlights | `string[]` | An array of highlights to apply to the text chunks. |
| query | `Query` | The query object used to retrieve the text chunks. |
| leftSentencesCount | `number` | The number of sentences to include before the main text chunk. |
| rightSentencesCount | `number` | The number of sentences to include after the main text chunk. |

__Returns__ A promise that resolves to an `{ chunks: TextChunk [] }` object type.

#### Example

:::info
Parameters values seems cryptics, but can be found in each Record retrieved after a search.
Offset values and length are part of a Record.
This function allow you to extract text at specific places
:::

```js title="example-text-chunks.js"
const query = {
  name,
  "text": "tesla"
};

// do not use originalLocations
const response = await fetchTextChunks(
  "record.id",
  [
    { offset: 14937, length: 10 },
    { offset: 538, length: 7 },     // "geo" chunks
    { offset: 14937, length: 147 }, // "extractslocations" chunk
    { offset: 1069, length: 4 },    // "entity1" chunk
    { offset: 1188, length: 13 },   // "person" chunk

    {offset:25803,length:6},{offset:25955,length:6},{offset:26199,length:6},{offset:26279,length:6}
  ],
  ["extractslocations","matchlocations","person","geo","company","money"],
  [],
  query, 1, 3 );

// display each text chunk
response.chunks.forEach(chunk => console.log(chunk.text));
```