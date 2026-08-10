---
title: Navigation
---

The `NavigationService` exposes Angular router events as observables and provides helpers to extract route information from URLs.

## Observables

### `navigationEnd$`

Emits `NavigationEnd` router events. Taps into the stream to extract the route name, notify the audit service of route changes, and share the latest value with new subscribers.

**Type** `Observable<RouterEvent>`

### `path$`

Emits the current tab name extracted from the URL pathname.

**Type** `Observable<string>`

## Example

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { NavigationService } from '@sinequa/atomic-angular';

const navigationService = inject(NavigationService);

navigationService.navigationEnd$.subscribe(event => {
  console.log('Navigation ended:', event);
});

navigationService.path$.subscribe(tab => {
  console.log('Current tab:', tab);
});
```
