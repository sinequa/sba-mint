---
title: Sort Selector
---

The `SortSelectorComponent` renders a dropdown for selecting the sort order of search results. It reads available sort options from the application's query configuration and emits the selected choice.

### Sort Options Resolution

1. **Tab search**: extracts sorting choices from the specific tab configuration.
2. **Regular query**: uses sorting choices from the query configuration.
3. **Fallback**: returns an empty array if no choices are available.

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

## Usage

```typescript title="sample.component.ts"
import { SortSelectorComponent } from '@sinequa/atomic-angular';

@Component({
  selector: 'sample',
  imports: [SortSelectorComponent],
  template: `<sort-selector [result]="result" (onSort)="onSortChanged($event)" />`,
})
export class SampleComponent {
  result = signal<Result | undefined>(undefined);
  onSortChanged(sort: SortingChoice) { /* ... */ }
}
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `result` | `Result` | ✓ | The search result containing the current query and sort state. |
| `position` | `Placement` | | Dropdown menu position. Default: `'bottom-start'`. |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `onSort` | `EventEmitter<SortingChoice>` | Emitted when the user selects a new sort option. |
