---
title: InfinityScroll
---

## Overview
Represents a directive that enables infinite scrolling behavior.
This directive listens for the intersection of the element with the viewport
and emits a `loadMore` event when the element becomes visible.

:::warning
This directive requires the `IntersectionObserver` API to be available in the browser.
:::

### Usage
```html
<div infinityScroll (onScroll)="loadMore()"></div>
```