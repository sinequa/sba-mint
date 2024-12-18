---
title: Menu
---

## Overview

The `Menu` component is an Angular component that provides a dropdown menu functionality.

### Properties

| Property     | Type                | Description                                                                 |
|--------------|---------------------|-----------------------------------------------------------------------------|
| `cn`         | `Function`          | Utility function for conditional class names.                               |
| `default`    | `string`            | Default class names for the dropdown menu.                                  |
| `isOpen`     | `Signal<boolean>`   | Signal to track the open/close state of the menu.                           |
| `position`   | `Input<Placement>`  | Input to set the position of the dropdown menu.                             |
| `className`  | `Input<string>`     | Input to set additional class names for the dropdown menu.                  |
| `disabled`   | `Input<boolean>`    | Input to set the disabled state of the menu.                                |
| `autoClose`  | `Input<boolean>`    | Input to enable/disable auto-closing the menu when an item is clicked.      |
| `dropdown`   | `ViewChild<ElementRef>` | Reference to the dropdown element.                                      |
| `trigger`    | `ViewChild<ElementRef>` | Reference to the trigger element.                                       |
| `width`      | `Signal<number>`    | Signal to track the width of the dropdown menu.                             |

### Methods

| Method              | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `ngAfterViewInit()` | Lifecycle hook that initializes auto-update for positioning the dropdown.   |
| `toggle()`          | Toggles the open/close state of the menu.                                   |
| `close()`           | Closes the menu.                                                            |
| `calculatePosition()` | Computes and sets the position of the dropdown menu based on the trigger element. |
| `contentClicked()`  | Handles click events on the dropdown content and closes the menu if `autoClose` is enabled. |

### Events

| Event       | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `@HostListener('document:click', ['$event']) clickout(event: Event)` | Listens for click events outside the dropdown to close the menu. |


## Examples

The `MenuComponent` can be used in the template of a parent component as follows:

### Basic
```html
<Menu>
  <!-- Insert button content here -->
  <div menu-content>
    <!-- Insert dropdown menu content here -->
  </div>
</Menu>
```

### Nested menu

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

You can create a high menu depth if you wish.