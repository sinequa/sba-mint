---
title: Filters
---

The `Filters` system provides a unified interface for displaying, managing, and interacting with all active filters in your Angular application. It acts as a central hub for filter-related UI, integrating with aggregations, filter buttons, and advanced filter drawers.

## Overview

Filters are a key part of the search experience, allowing users to refine results by applying, removing, or modifying filter criteria. The filters system is composed of several components:

- [FiltersBarComponent](filters-bar.md): Displays active filters as buttons, provides clear-all and basket management, and handles overflow.
- [FilterButtonComponent](filter-button.md): Represents an individual filter as a button, allowing removal or quick actions.
- [MoreComponent](more.md): Handles overflowed filters and provides access to additional filter controls.
- [AggregationComponent](../aggregation.md): Renders a faceted filter (aggregation) with search, count, and tree/list support.
- [AdvancedFiltersComponent](advanced-filters.md): Drawer-based UI for advanced filter management, including custom fields and suggestions.

## Usage Example

```ts
@Component({
  selector: 'my-component',
  template: `
    <filters-bar />
    <!-- Optionally, advanced filters drawer -->
    <advanced-filters />
  `,
  standalone: true,
  imports: [FiltersBarComponent, AdvancedFiltersComponent]
})
export class MyComponent {}
```

## Notes

- The filters system is highly modular; you can use only the components you need.
- All filter state is managed via stores (`AggregationsStore`, `QueryParamsStore`, etc.), ensuring consistency across the UI.
- For details on aggregation-specific features, see the [Aggregation documentation](../aggregation.md).
