---
title: Backdrop
---

The `BackdropComponent` renders a full-screen dark overlay that appears behind the `DrawerComponent` when it is opened. It is automatically controlled by the drawer — no manual management is required.

## Usage

```typescript title="app.component.ts"
import { BackdropComponent } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-root',
  imports: [BackdropComponent],
  template: `
    <router-outlet />
    <app-backdrop />
    <app-drawer-stack />
  `,
})
export class AppComponent {}
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `backdropVisible` | `boolean` | | Whether the backdrop is currently visible. Used to trigger CSS animations. |

---

## BackdropService

The `BackdropService` controls the backdrop's visibility programmatically.

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { BackdropService } from '@sinequa/atomic-angular';

const backdropService = inject(BackdropService);
backdropService.show();
backdropService.hide();
```

### Methods

#### `show()`

Makes the backdrop visible.

```typescript
show(): void
```

#### `hide()`

Hides the backdrop.

```typescript
hide(): void
```

### Observables

#### `isVisible`

**Type** `BehaviorSubject<boolean>` — emits `true` when the backdrop is visible.
