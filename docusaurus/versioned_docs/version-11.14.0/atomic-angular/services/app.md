---
title: App
---

The `AppService` retrieves the application configuration from the Sinequa server.

## Methods

### `getApp()`

Fetches the application configuration via HTTP GET.

```typescript
getApp(): Observable<CCApp>
```

**Returns** `Observable<CCApp>` — emits the application configuration. Errors are logged and an empty observable is returned on failure.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AppService } from '@sinequa/atomic-angular';

const appService = inject(AppService);

appService.getApp().subscribe(appConfig => {
  console.log(appConfig);
});
```
