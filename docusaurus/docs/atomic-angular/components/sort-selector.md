---
title: Sort Selector
sidebar_class_name: update
---

The `SortSelectorComponent` provides a dropdown menu for selecting the sort order of search results. It displays available sorting options (such as relevance, date, etc.) and emits an event when the user selects a new sort option.

## Features

- Displays current sort option and allows changing it via a dropdown menu
- Integrates with application queries and configuration for available sorting choices
- Emits the selected sort option to the parent component
- Supports both ascending and descending order
- Fully standalone and can be used in any Angular template

### Sort Options Resolution

The component retrieves sorting options through the following logic:

The component resolves sort options using the following logic:

1. **Query Type Detection**: Determines if the current query is a tab search or regular query  
2. **Tab Search**: If the query uses tab search, extracts sorting choices from the specific tab configuration  
3. **Regular Query**: Uses the sorting choices directly from the query configuration  
4. **Fallback**: Returns an empty array if no sorting choices are found or if choices are undefined/empty string  

<details>
  <summary>Flowchart of Sort Options Resolution</summary>
  ```mermaid
  flowchart TD
    A[Start] --> B{Is query a tab search?}
    B -- Yes --> C[Extract sorting choices from tab configuration]
    B -- No --> D[Use sorting choices from query configuration]
    C --> E{Are sorting choices defined and non-empty?}
    D --> E
    E -- Yes --> F[Return sorting choices]
    E -- No --> G[Return empty array]
  ```
</details>

## API Reference

### Inputs

- `result` (**required**): The `Result` object containing the current query and sort state
- `position` (optional): The dropdown menu position (default: `'bottom-start'`)

### Outputs

- `onSort`: Emits the selected `SortingChoice` when the user selects a new sort option

## Usage

```html
<sort-selector [result]="result" (onSort)="onSortChanged($event)"></sort-selector>
```

### Example

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

- The available sorting options are defined in the application's query configuration
- The component handles both tab-specific and global query sorting configurations
- Global relevance sorting is automatically filtered out when results don't support relevance scoring
- The sort icon changes based on ascending/descending order
