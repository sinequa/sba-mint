---
title: NavbarTabs
---

## Overview

The `NavbarTabs` component is an Angular component that displays the child routes of your `search` route as tabs.

### Properties

| Property          | Type                  | Description                                                                                                |
|-------------------|-----------------------|------------------------------------------------------------------------------------------------------------|
| `searchText`      | `Signal<string>`      | The current search text.                                                                                   |
| `visibleTabCount` | `Signal<number>`      | The number of tabs that should be visible. Calculated automatically using the `overflowManager` directive. |
| `currentPath`     | `Signal<string>`      | The current active route path.                                                                             |
| `tabs`            | `Signal<NavbarTab[]>` | The list of tabs generated from the application's router configuration.                                    |
| `moreTabs`        | `Signal<NavbarTab[]>` | List of tabs to display in the "More" menu.                                                                |

### Methods

| Method              | Signature   | Description                                                                 |
|---------------------|-------------|-----------------------------------------------------------------------------|
| `changeTab`         | `(): void`  | Triggers the drawer closing. The redirection is handled with routerlink.    |

## Examples

The `NavbarTabsComponent` can be used in the template of a parent component as follows:

```html
<navbar-tabs />
