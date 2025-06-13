---
title: SortSelector
---

## Overview

The `SortSelectorComponent` provides a dropdown menu for selecting the sort order of search results. It displays available sorting options (such as relevance, date, etc.) and emits an event when the user selects a new sort option.

## Features

- Displays current sort option and allows changing it via a dropdown menu
- Integrates with application queries and configuration for available sorting choices
- Emits the selected sort option to the parent component
- Supports both ascending and descending order
- Fully standalone and can be used in any Angular template

## Inputs

- `result` (**required**): The `Result` object containing the current query and sort state
- `position` (optional): The dropdown menu position (default: `'bottom-start'`)

## Outputs

- `onSort`: Emits the selected `SortingChoice` when the user selects a new sort option

## Usage

```html
<sort-selector [result]="result" (onSort)="onSortChanged($event)"></sort-selector>
```

## Example

```ts
@Component({
  selector: 'my-component',
  template: `
    <sort-selector [result]="result" (onSort)="onSortChanged($event)" />
  `,
  imports: [SortSelectorComponent]
})
export class MyComponent {
  result = { /* ... */ };
  onSortChanged(sort) {
    // handle sort change
  }
}
```

## Notes

- The available sorting options are defined in the application's query configuration.
- The component uses the `DropdownComponent` and other UI primitives for rendering.
- The sort icon changes based on ascending/descending order.
