---
title: getMetadata
---

Retrieves metadata from an article record and returns it as a normalized array of display objects. Useful for rendering metadata fields (authors, keywords, dates, etc.) in a consistent format.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `article` | `Article` | ✓ | The article object to extract metadata from |
| `metadata` | `KeyOf<Article>` | ✓ | The field key to retrieve |

**Returns** `{ display: string }[]` — array of display objects, one per metadata value.

**Example**

```typescript title="get-metadata.ts"
import { getMetadata } from '@sinequa/atomic';

const article = {
  id: '123',
  title: 'Sample Article',
  authors: ['John Doe', 'Jane Smith'],
  keywords: ['technology', 'research']
};

const authors = getMetadata(article, 'authors');
// [{ display: 'John Doe' }, { display: 'Jane Smith' }]

const keywords = getMetadata(article, 'keywords');
// [{ display: 'technology' }, { display: 'research' }]
```
