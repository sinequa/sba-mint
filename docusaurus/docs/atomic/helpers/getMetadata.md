---
title: getMetadata
---

Retrieves metadata from an article object.

| parameter | type | description |
| --- | --- | --- |
| `article` | `Article` | The article object containing the metadata |
| `metadata` | `KeyOf<Article>` | The key of the metadata to retrieve. |

__Returns__ An array of objects with a `display` property representing the metadata.

#### Example

```js title="get-metadata.js"
import { getMetadata } from "@sinequa/atomic";

// Sample article object
const article = {
  id: "123",
  title: "Sample Article",
  authors: ["John Doe", "Jane Smith"],
  publicationDate: "2023-05-15",
  keywords: ["technology", "science", "research"]
};

// Retrieve authors metadata
const authorsMetadata = getMetadata(article, "authors");
console.log("Authors:", authorsMetadata);
// Output: Authors: [{ display: "John Doe" }, { display: "Jane Smith" }]

// Retrieve publication date metadata
const dateMetadata = getMetadata(article, "publicationDate");
console.log("Publication Date:", dateMetadata);
// Output: Publication Date: [{ display: "2023-05-15" }]

// Retrieve keywords metadata
const keywordsMetadata = getMetadata(article, "keywords");
console.log("Keywords:", keywordsMetadata);
// Output: Keywords: [{ display: "technology" }, { display: "science" }, { display: "research" }]
```
