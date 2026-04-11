---
title: Sponsored Links
sidebar_class_name: update
---

The Sponsored Links module provides a function to fetch promoted or featured links associated with a search query. These links are returned alongside regular search results to enhance discoverability.

## Types

### `LinkResult`

```typescript
interface LinkResult {
  id: string;
  title: string;
  url: string;
  icon: string;
  thumbnail: string;
  tooltip: string;
  summary: string;
  rank: number;
  relevance: number;
}
```

## Functions

### `fetchSponsoredLinks()`

Fetches sponsored links matching the current query from a given web service.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `webservice` | `string` | ✓ | Name of the sponsored links web service configured on the server |
| `query` | `Query` | ✓ | The search query context |

**Returns** `Promise<LinkResult[]>` — array of sponsored link objects.

**Example**

```typescript title="fetch-sponsored-links.ts"
import { fetchSponsoredLinks } from '@sinequa/atomic';

const links = await fetchSponsoredLinks('sponsoredlinks', {
  name: '_query',
  text: 'electric vehicles'
});

links.forEach(link => {
  console.log(link.title, link.url);
});
```
