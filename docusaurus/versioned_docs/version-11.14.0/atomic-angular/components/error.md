---
title: Error
sidebar_class_name: update
---

The `ErrorComponent` displays a stylized error page and allows the user to reload the application.

## Usage

```typescript title="app.routes.ts"
import { ErrorComponent } from '@sinequa/atomic-angular';

export const routes: Routes = [
  { path: 'error', component: ErrorComponent },
];
```

## API Reference

### Methods

#### `reload()`

Redirects to the base path and triggers a full page reload.

```typescript
reload(): void
```
