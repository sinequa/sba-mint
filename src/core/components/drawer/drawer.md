## DrawerComponent

This component represents a drawer that can be opened and extended. Each instance of the DrawerComponent has its own drawer service to handle its state and link it to the drawer stack.

**Selector:** `app-drawer`

**Standalone:** true

**Providers:** DrawerService

### Description

The DrawerComponent is responsible for managing the state and behavior of a drawer. It provides functionality for opening and extending the drawer, as well as handling mouse events for resizing the drawer width. It has no template on its own, in order to use it you should inherit from the component and provide your own template.

It sets up a grid of 3 columns, ruled by the HostBinding `drawerGridTemplateColumns`:
- The backdrop, that takes all the available space between the left edge of the screen and the content
- The content, that fills the rest of the space, by default `minmax(min-content, 1fr)`
- The extended section, an additional area with a width defined by the CSS variable `--drawer-subdrawer-width`

Drawer also handle animations for both opened, extended and resizing state.

Here's a basic PreviewComponent that inherits from the Drawer:
```html
<!-- 1st column: the backdrop area -->
<div
  (click)="drawer.toggleExtension()"
  (keydown.escape)="drawer.toggleExtension()"
  [attr.aria-hidden]="true"
></div>

<!-- 2nd column: your content -->
<div class="flex overflow-auto bg-white">
  <!-- The handle for resizing your content area when the drawer is extended -->
  <div
    #drawerHandle
    class="w-[5px] h-full fixed hover:cursor-ew-resize"
    [ngClass]="{ hidden: (drawer.isExtended | async) === false }"
  ></div>

  <!-- The component the render inside your drawer -->
  <div>
    Main quest
  </div>
</div>

<!-- 3rd column: the extended search, or any other component -->
<div>
  Side quest
</div>
```

```ts
@Component({...})
export class DrawerPreviewComponent extends DrawerComponent {}
```

### Host Bindings

- `[attr.drawer-opened]`: Binds to the `drawerOpened` signal to set the attribute `drawer-opened` based on the state of the drawer.
- `[attr.drawer-extended]`: Binds to the `drawerExtended` signal to set the attribute `drawer-extended` based on the state of the drawer.

### Host Listeners

- `mousemove`: Listens to the `mousemove` event and updates the width of the drawer based on the mouse position if the drawer is in sliding mode.
- `mousedown`: Listens to the `mousedown` event and enables sliding mode if the event target is the drawer handle.
- `mouseup`: Listens to the `mouseup` event and disables sliding mode if the drawer is in sliding mode.

### View Children

- `drawerHandle`: References the `drawerHandle` element in the template.

### Public API

- `drawerOpened`: A signal that emits a boolean value indicating whether the drawer is opened or closed.
- `drawerExtended`: A signal that emits a boolean value indicating whether the drawer is extended or collapsed.

### Protected API

- `drawer`: An instance of the DrawerService used to manage the state of the drawer.

### Private API

- `element`: An instance of ElementRef used to access the native element of the component.
- `selectionHistory`: An instance of SelectionHistoryService used to manage the selection history.
- `isSliding`: A boolean flag indicating whether the drawer is currently in sliding mode.
- `defaultDrawerGridTemplate`: A string representing the default grid template columns of the drawer.
- `sub`: A Subscription object used to manage subscriptions to observables.

### Lifecycle Hooks

- `ngOnInit`: Initializes the component and sets the default drawer grid template.
- `ngOnDestroy`: Cleans up subscriptions when the component is destroyed.

### Private Methods

- `disableAnimation`: Disables CSS transition animation for the drawer.
- `enableAnimation`: Enables CSS transition animation for the drawer.
- `resetGridTemplateColumns`: Resets the grid template columns of the drawer to the default value.