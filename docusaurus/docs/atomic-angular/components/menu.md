---
title: Menu
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

The `Menu` component is an Angular component that provides dropdown menu functionality.

### Properties

| Property    | Type                    | Description                                                                    |
|-------------|-------------------------|--------------------------------------------------------------------------------|
| `cn`        | `Function`              | Utility function for conditional class names.                                  |
| `default`   | `string`                | Default class names for the dropdown menu.                                     |
| `isOpen`    | `Signal<boolean>`       | Signal to track the open/close state of the menu.                              |
| `position`  | `Input<Placement>`      | Input to set the position of the dropdown menu.                                |
| `className` | `Input<string>`         | Input to set additional class names for the dropdown menu.                     |
| `disabled`  | `Input<boolean>`        | Input to set the disabled state of the menu.                                   |
| `autoClose` | `Input<boolean>`        | Input to enable/disable auto-closing the menu when an item is clicked.         |
| `dropdown`  | `ViewChild<ElementRef>` | Reference to the dropdown element.                                             |
| `trigger`   | `ViewChild<ElementRef>` | Reference to the trigger element.                                              |
| `width`     | `Signal<number>`        | Signal to track the width of the dropdown menu.                                |

### Methods

| Method              | Signature   | Description                                                                               |
|---------------------|-------------|-------------------------------------------------------------------------------------------|
| `ngAfterViewInit`   | `(): void`  | Lifecycle hook that initializes auto-update for positioning the dropdown.                 |
| `toggle`            | `(): void`  | Toggles the open/close state of the menu.                                                 |
| `close`             | `(): void`  | Closes the menu.                                                                          |
| `calculatePosition` | `(): void`  | Computes and sets the position of the dropdown menu based on the trigger element.         |
| `contentClicked`    | `(): void`  | Handles click events on the dropdown content and closes the menu if `autoClose` is enabled. |

### Events

| Event      | Signature                                                    | Description                                                        |
|------------|--------------------------------------------------------------|--------------------------------------------------------------------|
| `clickout` | `@HostListener('document:click', ['$event']) (event: Event)` | Listens for click events outside the dropdown to close the menu.   |


## Examples

The `MenuComponent` can be used in the template of a parent component as follows:

<Tabs>
<TabItem value="basic" label="Basic">

```html
<Menu>
  <!-- Insert button content here -->
  <div menu-content>
    <!-- Insert dropdown menu content here -->
  </div>
</Menu>
```

</TabItem>
<TabItem value="nested" label="Nested Menu">

```html
<Menu>
  <!-- Insert button content here -->
  <ng-container menu-content>
    <!-- Insert dropdown menu content here -->
    <Menu position="left-start">
      <div menu-content>
        <!-- Insert dropdown menu content here -->
      </div>
    </Menu>
  </ng-container>
</Menu>
```
Nested menus allow for creating deep menu structures.

</TabItem>
</Tabs>
