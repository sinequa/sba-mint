---
title: SponsoredResults
---

The `SponsoredResultsComponent` displays a list of sponsored links (promoted results) relevant to the current search query. It fetches and shows up to three sponsored results, each with a title, link, and a "PROMOTED" badge.

## Features

- Fetches sponsored links based on the current query
- Displays up to three sponsored results
- Each result includes a title, external link icon, and a promoted badge
- Fully standalone and accessible (uses ARIA roles)

## Usage

```html
<sponsored-results></sponsored-results>
```

## Example

```ts
@Component({
  selector: 'my-component',
  template: `
    <sponsored-results />
  `,
  imports: [SponsoredResultsComponent]
})
export class MyComponent {}
```

## Notes

- The component uses the application's sponsored links configuration and the current query to fetch results.
- The promoted badge appears on hover for accessibility and clarity.

## Schema

```mermaid
flowchart TD
    A[AppStore & QueryParamsStore] -->|Inject & get state| B[SponsoredResultsComponent]
    B -->|Fetch sponsoredLinks| C[fetchSponsoredLinks]
    C -->|Return up to 3 links| D[Display in template]
    D --> E[User sees promoted results]
    D --> F[Each result: title, link, badge]
```

- The component injects AppStore and QueryParamsStore to access app state and current query.
- It computes the sponsored links and fetches up to three relevant results.
- Results are displayed as a list, each with a title, external link, and a "PROMOTED" badge.
