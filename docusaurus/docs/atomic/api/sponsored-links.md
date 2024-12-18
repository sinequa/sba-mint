---
title: Sponsored Links
---

## Overview
This module provides functionality for retrieving sponsored links based on user queries. It enables:

- Fetching relevant sponsored content tied to search terms
- Integrating promotional or featured links into search results
- Enhancing search experiences with targeted, context-specific links

These operations allow for the seamless incorporation of sponsored content alongside regular search results, potentially improving user engagement and monetization opportunities.


### fetchSponsoredLinks()
Fetches sponsored links based on the provided webservice and query.  
This function sends a POST request to the "query.links" endpoint with the specified webservice and query parameters to retrieve sponsored links. 


| Parameter | Type | Description |
| --- | --- | --- |
| webservice | `string` | The name of the webservice to use for fetching sponsored links. |
| query | `Query` | The query object containing search parameters. |

__Returns__ A promise that resolves to an array of LinkResult objects, each representing a sponsored link with the original query attached.

```js title="LinkResult Type"
export interface LinkResult {
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

#### Example
```js title="example-sponsored-links.js"
import { fetchSponsoredLinks } from "@sinequa/atomic";

// Define the webservice and query
const webservice = "sponsoredlinks";
const query = {
  name: "_query",
  text: "electric vehicles"
};

// Fetch sponsored links
fetchSponsoredLinks(webservice, query)
  .then(sponsoredLinks => {
    console.log("Sponsored Links:", sponsoredLinks);
    // Output: an array of sponsored link objects
  })
  .catch(error => {
    console.error("Error fetching sponsored links:", error);
  });

```