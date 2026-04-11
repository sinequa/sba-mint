---
title: Application
sidebar_class_name: update
---

The `ApplicationService` initializes the application: fetches app config, loads the principal and user settings, and optionally creates Angular routes from the Sinequa administration configuration.

## Methods

### `initialize()`

Initializes the application and optionally creates Angular routes.

```typescript
initialize(withCreateRoutes?: boolean): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `withCreateRoutes` | `boolean` | | Whether to create routes after initialization. Default: `true`. |

**Returns** `Promise<void>` — resolves when the application is fully initialized.

When `withCreateRoutes` is `true`, Angular routes are created from the `routes` custom JSON defined in the Sinequa administration panel and merged into the `search` children route.

**Example**

```typescript title="app.config.ts"
import { inject } from '@angular/core';
import { ApplicationService } from '@sinequa/atomic-angular';

provideAppInitializer(() => {
  const applicationService = inject(ApplicationService);
  return applicationService.initialize();
});
```

## Components Registration

Register page components via the `ROUTE_COMPONENTS` injection token so they can be wired to dynamically created routes.

```typescript
export type ComponentMapping = {
  path: string;
  component: Type<unknown>;
  isRoot?: boolean;
};
```

**Example**

```typescript title="app.config.ts"
import { ROUTE_COMPONENTS } from '@sinequa/atomic-angular';
import { Home } from './pages/home';
import { Search } from './pages/search';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ROUTE_COMPONENTS,
      useValue: [
        { path: 'home', component: Home },
        { path: 'search', component: Search, isRoot: true },
      ],
      multi: true,
    },
  ],
};
```
