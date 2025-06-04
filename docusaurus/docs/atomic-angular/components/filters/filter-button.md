---
title: FilterButtonComponent
---

The `FilterButtonComponent` represents an individual filter as a button, allowing removal or quick actions. It is used within the `FiltersBarComponent` to display each active filter.

## Features

- Displays a single filter as a button
- Allows removal of the filter
- Can be extended for custom filter actions

## Usage Example

```ts
<filter-button [name]="filter.name" [column]="filter.column" />
```

## Notes

- Typically used inside `FiltersBarComponent`.
- Integrates with filter state managed by stores.
