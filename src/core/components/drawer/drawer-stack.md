# DrawerStackComponent

The `DrawerStackComponent` is an Angular component that manages a stack of drawers. It allows opening, closing, and manipulating the drawers in the stack.

The constant `DRAWER_STACK_MAX_COUNT` defines the maximum number of **rendered** drawers, above that numbers a history will be kept, but the component will be destroyed to allow new ones on top of the pile. Once the top drawer gets closed, the drawer on top of the history pile will get instanciated back at the bottom of the stack. The history length is provided by the `SelectionHistoryService`.

`DrawerStackComponent` has been designed to open drawers from the right to left, if you want to change this behavior you'll need to change at those rules for the stack:
```css
:host {
  position: absolute;
  top: 50%;
  right: 0;                                 /* left instead of right */

  --drawer-width: 46;
  --drawer-subdrawer-width: 400px;

  z-index: theme('zIndex.drawer');

  transition: right 300ms linear;           /* left instead of right */

  &[drawer-opened="true"] {
    right: calc(1% * var(--drawer-width));  /* left instead of right */
  }
}
```
As well as how your drawer interact and re-order its columns.

To render your stack properly with a backdrop, go to your `app.component.html` and add:
```html
<router-outlet></router-outlet>

<app-backdrop />

<!-- You want your drawer stack above the backdrop -->
<app-drawer-stack />
```

The `BackdropComponent` is just a black veil over the entire viewport, the behavior of closing by clicking on it is handled by the `DrawerComponent` itself.

## API

### Properties

- `drawerOpened: boolean`: Indicates whether the drawer is opened or closed.

### Methods

- `toggleAssistant(): void`: Toggles the assistant.
- `openTopDrawer(index: number): void`: Opens the specified history index as top drawer.
- `closeTopDrawer(): void`: Closes the top drawer.
- `closeAllDrawers(): void`: Closes all drawers.
- `collapseTopDrawer(): void`: Collapses the top drawer.
- `toggleTopDrawerExtension(): void`: Toggles the extension of the top drawer.
