---
title: Navigation Service
---

## Overview

The `NavigationService` is responsible for handling navigation events and extracting relevant information from the URL.

### navigationEnd$

Observable that emits events of type `NavigationEnd` from the Angular Router.

**Operations:**
- Maps all router events to `RouterEvent`.
- Filters the events to only include instances of `NavigationEnd`.
- Taps into the event stream to extract the route name from the URL and notify the audit service of route changes, excluding the "loading" route and duplicate navigations.
- Updates the `urlAfterNavigation` property with the current URL after navigation.
- Shares the replayed value with a buffer size of 1 to ensure subscribers receive the latest emitted value.

**Type:** `Observable<RouterEvent>`

### path$

An observable that emits the tab extracted from the URL pathname or the last part of the URL.

**Operations:**
- Listens to navigation end events and processes the URL to determine the current tab.
- Creates a fake URL object to extract the pathname.
- Uses the `getQueryParamsFromUrl` function to extract the tab from the URL pathname or defaults to the last part of the URL if no tab is found.

**Type:** `Observable<string>`

### Example

```typescript
import { NavigationService } from '@sinequa/atomic-angular';

constructor(private navigationService: NavigationService) {
  this.navigationService.navigationEnd$.subscribe(event => {
    console.log('Navigation ended:', event);
  });

  this.navigationService.path$.subscribe(tab => {
    console.log('Current tab:', tab);
  });
}
```