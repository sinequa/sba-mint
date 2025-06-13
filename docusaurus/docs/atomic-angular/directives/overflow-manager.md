---
title: OverflowManager
---

## Overview

Directive that handles a list of elements and manages the overflow of the list. It listens to the resize event and emits a the number of elements that can be displayed in the list to a stop element.

3 directives are available:

- `overflowManager`: The directive that manages the overflow of the list.
- `overflowItem`: The directive that represents an item in the list.
- `overflowStop`: The directive that represents the stop marker in the list.

Both `overflowItem` and `overflowStop` are required to be used with the `overflowManager` directive and useless without the manager, they're used to calculate the overflow using the highest item `getBoundingClientRect().right` and the stop marker left values.

You can define a `target` to be used as the container of the list, this is useful when your host's component is the container the list (see usage section for example). If no target is defined, the directive will use its host's component as the container.

You can define a `margin` to be added to the calculation of the overflow, this is useful when you have a margin between the items and the stop marker.

:::info
Default `margin` is `4px`
:::

:::warning
The `overflowManager` directive cannot be used inside the `hostDirectives` array of a component as it needs access to the DOM, see usage section for example.
:::

You can listen to `count` output to get the number of items that can fit before the stop marker.

:::warning
If you use this directive with text translated with **Transloco**, see dedicated usage section for utility function.
:::

## Usage

### Basic

```ts title="some-component.ts"
@Component({
  ...
  template: `
    <div class="flex gap-2" overflowManager (count)="onCount($event)">
      <ul>
        @for (item of [1, 2, 3, 4, 5]) {
          <li overflowItem>{{ item }}</li>
        }
      </ul>

      <div overflowStop></div>
    </div>
  `
})
export class SomeComponent { 
  onCount(count: number) {
    console.log(count);
  }
}
```

## Host element is the list

```ts title="some-component.ts"
@Component({
  ...
  template: `
    <ng-container
      overflowManager
      [target]="el.nativeElement"
      (count)="onCount($event)"
    >
      <ul>
        @for (item of [1, 2, 3, 4, 5]) {
          <li overflowItem>{{ item }}</li>
        }
      </ul>

      <div overflowStop></div>
    </ng-container>
  `
})
export class SomeComponent {
  readonly el = inject(ElementRef);

  onCount(count: number) {
    console.log(count);
  }
}
```

:::note
`ng-container` here is used as a middleware for the container element and won't be rendered in the DOM.
:::

### Use with translated field with **Transloco**

```ts title="some-component.ts"
@Component({
  ...
})
export class SomeComponent implements OnDestroy {
  readonly overflowManager = viewChild(OverflowManagerDirective);

  readonly transloco = inject(TranslocoService);

  private readonly sub = new Subscription();

  constructor() {
    // register to transloco events to update the overflow manager when translations are loaded
    // otherwise the overflow manager will count size of items without text
    this.sub.add(
      this.transloco.events$.pipe(
        debounceTime(250)
      ).subscribe(() => {
        this.overflowManager()?.countItems();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
```

:::note
**Transloco** emits several events when translations are loaded, we debounce the event to avoid multiple calls to the `countItems` method.
:::
