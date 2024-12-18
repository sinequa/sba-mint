---
title: Dropdown
---

## Overview

The dropdown component is a reusable component that can be used to create dropdowns in the application. It is designed to be used with the `DropdownDirective` to provide a dropdown menu that can be toggled open and closed.


### Properties

| Property     | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `isOpen`     | A signal that indicates whether the dropdown is open or closed.             |
| `position`   | An input property that specifies the placement of the dropdown. Default is 'bottom-start'. |
| `autoClose`  | An input property that determines whether the dropdown should automatically close when an item is clicked. |
| `disabled`   | An input property that indicates whether the dropdown is disabled.          |
| `dropdown`   | A view child reference to the dropdown wrapper element.                     |
| `trigger`    | A view child reference to the trigger element.                              |
| `width`      | A signal that holds the width of the dropdown, matching the trigger element's width. |

### Methods

| Method                | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `constructor`         | Initializes the dropdown component and sets up automatic updates for its position using `afterNextRender` and `autoUpdate`. |
| `toggle()`            | Toggles the dropdown's open state. If the dropdown is disabled, it does nothing. Otherwise, it updates the `isOpen` state and recalculates the dropdown's position. |
| `close()`             | Closes the dropdown by setting the `isOpen` state to `false`.               |
| `calculatePosition()` | Calculates and sets the position of the dropdown element relative to the trigger element using `computePosition` with middleware for offset, flip, and shift. Updates the dropdown's `left` and `top` styles and sets its width. |

### Events

| Event                 | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `clickout(event: Event)` | A host listener for document click events. Closes the dropdown if the click is outside the dropdown and trigger elements. |
| `contentClicked()`    | Handles the click event on the dropdown content. Closes the dropdown if `autoClose` is `true`. |

## Examples


### Basic Dropdown

```html
<Dropdown>
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>  
```

### Dropdown with Positioning

```html
<Dropdown position="top-start">
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

### Dropdown with Auto Close

```html
<Dropdown [autoClose]="true">
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

### Disabled Dropdown

```html
<Dropdown [disabled]="true">
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

### Custom Dropdown

```html
<Dropdown>
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>
</Dropdown>
```
