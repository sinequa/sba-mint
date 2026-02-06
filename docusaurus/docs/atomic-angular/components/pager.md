---
title: Pager
sidebar_class_name: deprecated
---

The `Pager` component is an Angular component that handles pagination, using results from the Search service.

:::warning
 The `Pager` component is marked as deprecated and will be removed in future releases. It is recommended to use TanStack Query's built-in pagination features for new implementations.
:::

## Documentation

The Pager component provides pagination controls for navigating through data sets.

:::info
 As an alternative to using the `pager` component, you can implement custom pagination controls using TanStack Query's infinite query methods:

 ```html
 <div class="flex justify-end mt-6 gap-2">
   <button
     (click)="query.fetchPreviousPage()"
     [disabled]="!query.hasPreviousPage() || query.isFetchingPreviousPage()">
     {{ query.isFetchingPreviousPage() ? 'Loading...' : 'previous page' }}
   </button>
   <button
     (click)="query.fetchNextPage()"
     [disabled]="!query.hasNextPage() || query.isFetchingNextPage()">
     {{ query.isFetchingNextPage() ? 'Loading...' : 'next page' }}
   </button>
 </div>
 ```

 This approach gives you more control over the pagination UI and leverages TanStack Query's built-in infinite query capabilities.
:::

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
