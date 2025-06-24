---
title: Backdrop
---

The `Backdrop` component is an Angular component that is intended to be used in combination with the `Drawer` component, adding a darker shade on the background when the `Drawer` is opened.

When placed in the template, it is automatically handled by the `Drawer` component.

### Properties

| Property          | Type      | Description                                                                          |
|-------------------|-----------|--------------------------------------------------------------------------------------|
| `backdropVisible` | `boolean` | Indicates whether the backdrop is currently visible. Used to trigger CSS animations. |

## Examples

The `BackdropComponent` just needs to be added to the base `AppComponent` of the application as follows:

```html
<app-backdrop />
```
