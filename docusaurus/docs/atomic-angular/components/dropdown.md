---
title: Dropdown
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

The `Dropdown` component is a reusable component that can be used to create dropdowns in the application. It is designed to be used with the `DropdownDirective` to provide a dropdown menu that can be toggled open and closed.


### Properties

| Property    | Type                    | Description                                                                                                |
|-------------|-------------------------|------------------------------------------------------------------------------------------------------------|
| `isOpen`    | `Signal<boolean>`       | A signal that indicates whether the dropdown is open or closed.                                            |
| `position`  | `Input<Placement>`      | An input property that specifies the placement of the dropdown. Default is `'bottom-start'`.               |
| `autoClose` | `Input<boolean>`        | An input property that determines whether the dropdown should automatically close when an item is clicked. |
| `disabled`  | `Input<boolean>`        | An input property that indicates whether the dropdown is disabled.                                         |
| `dropdown`  | `ViewChild<ElementRef>` | A view child reference to the dropdown wrapper element.                                                    |
| `trigger`   | `ViewChild<ElementRef>` | A view child reference to the trigger element.                                                             |
| `width`     | `Signal<number>`        | A signal that holds the width of the dropdown, matching the trigger element's width.                       |

### Methods

| Method              | Signature   | Description                                                                                                                                                            |
|---------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `constructor`       | `()`        | Initializes the dropdown component and sets up automatic updates for its position using `afterNextRender` and `autoUpdate`.                                            |
| `toggle`            | `(): void`  | Toggles the dropdown's open state. If the dropdown is disabled, it does nothing. Otherwise, it updates the `isOpen` state and recalculates the dropdown's position.    |
| `close`             | `(): void`  | Closes the dropdown by setting the `isOpen` state to `false`.                                                                                                          |
| `calculatePosition()` | Calculates and sets the position of the dropdown element relative to the trigger element using `computePosition` with middleware for offset, flip, and shift. Updates the dropdown's `left` and `top` styles and sets its width. |

### Events

| Event            | Signature        | Description                                                                                              |
|------------------|------------------|----------------------------------------------------------------------------------------------------------|
| `clickout`       | `(event: Event)` | A host listener for document click events. Closes the dropdown if the click is outside the dropdown and trigger elements. |
| `contentClicked` | `(): void`       | Handles the click event on the dropdown content. Closes the dropdown if `autoClose` is `true`.           |

## Examples

<Tabs>
<TabItem value="basic" label="Basic">

```html
<Dropdown>
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

</TabItem>
<TabItem value="positioning" label="Positioning">

```html
<Dropdown position="top-start">
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

</TabItem>
<TabItem value="autoClose" label="Auto Close">

```html
<Dropdown [autoClose]="true">
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

</TabItem>
<TabItem value="disabled" label="Disabled">

```html
<Dropdown [disabled]="true">
  <button>Toggle Dropdown</button>
  <div dropdown-content class="dropdown-content">
    Dropdown Content
  </div>
</Dropdown>
```

</TabItem>
<TabItem value="custom" label="Custom Content">

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

</TabItem>
</Tabs>
