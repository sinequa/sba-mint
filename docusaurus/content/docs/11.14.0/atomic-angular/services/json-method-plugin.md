---
title: JSON Method Plugin
---

The `JsonMethodPluginService` provides methods to call Sinequa JSON plugins via HTTP GET and POST requests.

## Methods

### `post()`

Calls a JSON plugin via HTTP POST.

```typescript
post<U>(method: string, query: U, options?: Options): Observable<any>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `method` | `string` | ✓ | The name of the JSON plugin method to call. |
| `query` | `U` | ✓ | Parameters to pass to the plugin. |
| `options` | `Options` | | HTTP request options. |

**Returns** `Observable<any>` — emits the plugin's response.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { JsonMethodPluginService } from '@sinequa/atomic-angular';

inject(JsonMethodPluginService).post('myMethod', { param: 'value' }).subscribe(response => {
  console.log(response);
});
```

### `get()`

Calls a JSON plugin via HTTP GET.

```typescript
get<U extends Record<string, string | boolean | number | Date | object | undefined>>(
  method: string,
  query: U,
  options?: Options
): Observable<any>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `method` | `string` | ✓ | The name of the JSON plugin method to call. |
| `query` | `U` | ✓ | Parameters to pass to the plugin. |
| `options` | `Options` | | HTTP request options. |

**Returns** `Observable<any>` — emits the plugin's response.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { JsonMethodPluginService } from '@sinequa/atomic-angular';

inject(JsonMethodPluginService).get('myMethod', { param: 'value' }).subscribe(response => {
  console.log(response);
});
```
