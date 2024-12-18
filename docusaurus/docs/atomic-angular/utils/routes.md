---
title: Routes
---

## Overview
The `getCurrentQueryName` and `getCurrentTab` functions are utility functions designed to work within Angular's dependency injection context. They help in retrieving specific route-related information, such as the current query name and the current tab's URL, respectively. These functions leverage Angular's router and dependency injection mechanisms to provide the required data based on the active route configuration.


:::important
This functions must be called in an injection context.
:::

### getCurrentQueryName()

Retrieves the current query name based on the current path and router configuration.

This function asserts that it is called within an injection context and then
uses Angular's dependency injection to access the router configuration. It
determines the current tab and searches for a route with the path 'search'
and a child route matching the current tab. If found, it returns the 'queryName'
data associated with that child route.

#### Usage
```ts title="test.component.ts"
import { getCurrentQueryName } from "@sinequa/atomic-angular";

@Component({
  selector: "test",
  standalone: true,
  ...
})
export class TestComponent
  injector = inject(Injector);

  test() {
    const currentTabQueryName = runInInjectionContext(this.injector, () => getCurrentQueryName());
    // Output: The query name if found, otherwise undefined.
  }
```

### getCurrentPath()

Retrieves the current path from the Angular `ActivatedRoute` service.

This function asserts that it is being called within an Angular injection context
and then injects the `ActivatedRoute` service to access the current route's snapshot URL.

#### Usage
```ts title="test.component.ts"
import { getCurrentPath } from "@sinequa/atomic-angular";

@Component({
  selector: "test",
  standalone: true,
  ...
})
export class TestComponent
  injector = inject(Injector);

  test() {
    const currentTabName = runInInjectionContext(this.injector, () => getCurrentPath());
    // Output: The current tab's URL as a string, or `undefined` if the route is not available.
  }

```
