---
title: InfiniteScroll
---

The `InfiniteScrollDirective` enables infinite scrolling on any element. It uses `IntersectionObserver` to detect when the element enters the viewport and emits a `onScroll` event.

:::warning
This directive requires the `IntersectionObserver` API to be available in the browser.
:::

## Usage

```html
<div infinityScroll (onScroll)="loadMore()"></div>
```

## API Reference

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `onScroll` | `EventEmitter<void>` | Emitted when the element becomes visible in the viewport. |
