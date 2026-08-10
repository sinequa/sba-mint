---
title: Pager
sidebar_class_name: deprecated
---

The `Pager` component is an Angular component that handles pagination, using results from the Search service.

### Properties

| Property          | Type                        | Description                                                                                                |
|-------------------|-----------------------------|------------------------------------------------------------------------------------------------------------|
| `configuration`   | `Input<PageConfiguration>`  | The pagination configuration settings.                                                                     |
| `page`            | `Signal<number>`            | The current page number.                                                                                   |
| `hasPages`        | `Signal<boolean>`           | Indicates whether multiple pages exist, based on the `configuration`.                                      |

### Methods

| Method           | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `nextPage()`     | Navigates to the next page.                                                 |
| `previousPage()` | Navigates to the previous page.                                             |

## Examples

The `PagerComponent` can be used in the template of a parent component as follows:

```html
<pager [configuration]="configuration" />
```
