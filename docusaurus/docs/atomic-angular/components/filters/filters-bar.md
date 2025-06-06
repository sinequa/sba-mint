---
title: FiltersBarComponent
---

The `FiltersBarComponent` displays all active filters as buttons, provides clear-all and basket management, and handles overflow. It acts as the main UI for interacting with applied filters.

## Features

- Displays all active filters as buttons
- Supports clearing all filters or basket
- Integrates with aggregations and advanced filters
- Handles overflow with a "More" button

## Usage

```ts title="sample.component.ts"
import { FiltersBarComponent } from "@angular/atomic-angular";

@Component({
    selector: "sample-component",
    imports: [FiltersBarComponent],
    template: `
    <filters-bar />
    `,
})
export class SampleComponent {}
```

## Methods

| Method       | Signature     | Description                                                        |
|--------------|--------------|--------------------------------------------------------------------|
| clearFilters | () => void   | Removes all active filters from the filter bar. Use this to reset the filter state. |
| clearBasket  | () => void   | Empties the basket, removing all selected items.                   |

## Component Interaction Schema

```mermaid
flowchart TD
    User -- interacts --> FiltersBarComponent
    FiltersBarComponent -- displays --> FilterButtonComponent
    FiltersBarComponent -- overflow --> MoreComponent
    FiltersBarComponent -- injects --> AggregationsStore
    FiltersBarComponent -- injects --> QueryParamsStore
```

## Store Interaction Schema

```mermaid
flowchart TD
    FiltersBarComponent -- injects --> AggregationsStore
    FiltersBarComponent -- injects --> QueryParamsStore
```

## Notes

- The filters bar is highly modular and can be used independently or with other filter components.
- All filter state is managed via stores (`AggregationsStore`, `QueryParamsStore`, etc.), ensuring consistency across the UI.
