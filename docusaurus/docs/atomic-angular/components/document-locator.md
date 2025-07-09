---
title: DocumentLocator
---

The `DocumentLocatorComponent` displays a breadcrumb-like navigation for a document's location within a hierarchy, allowing users to navigate through segments of the document's path. It is typically used to help users understand and interact with the structure of collections or folders in which a document resides.

## Features

- Displays the document's location as clickable segments (breadcrumbs)
- Handles overflow by moving extra segments into a dropdown menu
- Integrates with Angular routing and query parameters for navigation
- Responsive to container resizing

## Inputs

- `article` (**required**): The `Article` object whose location is to be displayed
- `aggregation` (**required**): The name of the aggregation to use for navigation

## Usage

```html
<document-locator [article]="myArticle" [aggregation]="'myAggregation'" />
```

## Example

```ts
@Component({
  selector: 'my-component',
  template: `
    <document-locator [article]="article" [aggregation]="'Collection'" />
  `,
  imports: [DocumentLocatorComponent]
})
export class MyComponent {
  article = { /* ... */ };
}
```

## Notes

- The component automatically manages visible and overflowed segments based on available width.
- Clicking a segment updates the query parameters and navigates to the corresponding location.
