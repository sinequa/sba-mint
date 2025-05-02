---
title: Sort Selector
---

## Overview

The `SortSelector` component is an Angular component that allows to choose a way of sorting.

It automatically gets the current query and gets the sorting choices from it.

### Properties

| Property      | Type                      | Description                                                                                             |
|---------------|---------------------------|---------------------------------------------------------------------------------------------------------|
| `result`  | `Input<Result>`         | The result of the search.                                                                          |
| `position`   | `Input<Placement>`          | Position for the dropdown. Defaults to `bottom-start`.                                                                              |
| `onSort` | `Output<SortingChoice>` | Emits an event with the new sorting choice to be applied. |

## Examples

The `SortSelectorComponent` can be used in the template of a search page that can provide it with the results data:

```html
<sort-selector [result]="result()" (onSort)="onSort($event)" />
```
