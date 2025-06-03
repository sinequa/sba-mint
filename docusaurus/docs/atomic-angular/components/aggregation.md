---
title: Aggregation
---

The `Aggregation` component allows you to display and interact with faceted filters in your Angular applications.

## Usage

```ts title="sample.component.ts"
import { AggregationComponent } from "@angular/atomic-angular";

@Component({
    selector: "sample-component",
    template: `
    <aggregation 
      name="People" 
      column="person" 
      [searchable]="true" 
      [showCount]="true"
      (onSelect)="handleSelection($event)" 
    />
    `,
}) export class SampleComponent {
    handleSelection(selected: boolean) {
      // Handle selection event
      console.log('Selection changed:', selected);
    }
}
```

### Properties

| Property | Type | Description |
|---|---|---|
| `name` | `string` | The name of the aggregation to display. |
| `column` | `string` | The column name used for the aggregation in the data source. |
| `headless` | `boolean` | When set to `true`, the component functions without rendering UI elements. Default is `false`. |
| `searchable` | `boolean \| undefined` | Enables or disables search functionality in the aggregation. If undefined, uses the value from aggregation settings. |
| `showCount` | `boolean` | Shows the count of applied filters when set to `true`. Default is `false`. |

### Events

| Event | Type | Description |
|---|---|---|
| `onSelect` | `EventEmitter<boolean>` | Emitted when an item in the aggregation is selected or deselected. |

### Features

- Supports tree and list aggregation structures
- Provides search functionality with suggestions
- Allows loading more items dynamically
- Displays applied filter count
- Supports clearing filters

### Methods

- `clear()`: Removes all filters for the current aggregation
- `apply()`: Applies the selected filters to the query
- `loadMore()`: Loads additional aggregation items when available
- `select()`: Sets the component in a state indicating it has a selection to be applied
