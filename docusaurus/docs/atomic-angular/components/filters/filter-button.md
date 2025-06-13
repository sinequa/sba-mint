---
title: FilterButtonComponent
---

The `FilterButtonComponent` represents an individual filter as a button, allowing removal or quick actions. It is used within the `FiltersBarComponent` to display each active filter.

## Features

- Displays a single filter as a button
- Allows removal of the filter
- Can be extended for custom filter actions

## Usage Example

```html
<filter-button [name]="filter.name" [column]="filter.column" />
```

## Inputs

| Name   | Type   | Description                       |
|--------|--------|-----------------------------------|
| name   | string | Name of the filter (required)     |
| column | string | Column key for the filter (required) |

## Notes

- Typically used inside `FiltersBarComponent`.
- Integrates with filter state managed by stores.
